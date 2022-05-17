import json
import logging
import os
import subprocess
import sys

from watchdog.events import FileSystemEventHandler

from .notification import send_email

logger = logging.getLogger()

class FASTQFileHandler(FileSystemEventHandler):

    def __init__(self, app_loc):
        logger.debug("FASTQ FILE HANDLER INITIATED")
        self.app_loc = app_loc
        self.num_files_classified = 0

    def on_any_event(self, event):
        print("NEW FILE EVENT")
        # if fasta file is created
        if event.src_path.endswith(".fastq") or event.src_path.endswith(".fasta"):
            logger.debug(
                'event type: ' + str(event.event_type) + 'path: ' + str(
                    event.src_path) + 'num files classified: ' + str(self.num_files_classified))

            # paths for minimap2 out file and minimap2 report file
            minimap2_output = self.app_loc + 'minimap2/runs/' + os.path.basename(event.src_path) + '.out.paf'

            # paths for final output file and final report file
            final_output = self.app_loc + 'minimap2/final.out.paf'

            # figuring out the index name
            import glob
            files = glob.glob(self.app_loc + 'database/*')
            indices = [x for x in files if x.endswith('mmi')]
            index_file = ""

            if len(indices) < 1:
                logger.error("ERROR: Database not found!")
                sys.exit(1)
            else:
                index_file = indices[0]

            cmd = 'minimap2 ' + index_file + ' ' + event.src_path + ' -o ' + minimap2_output
            logger.debug(cmd, "DEBUG")

            proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
            (output, err) = proc.communicate()
            proc.wait()
            logger.debug(f"COMMAND OUTPUT: {str(output)}")

            # if running minimap2 was successful
            if os.path.getsize(minimap2_output) <= 0:
                return
            else:

                # see which alert sequence this new data matches to and update its percent match value
                # get the name of the header of alert sequence it matches to
                minimap2_output_line = os.popen('awk "{print $1}" ' + minimap2_output).read().strip().split("\t")
                match_alert_header = minimap2_output_line[5]

                # Calculate the new percent threshold
                num_match = int(minimap2_output_line[9])
                tot_len = int(minimap2_output_line[6])
                percent_match_value = (num_match / tot_len) * 100

                # Add the new calculated value to the alert threshold
                alertinfo_cfg_file = os.path.join(self.app_loc, 'alertinfo.cfg')
                alertinfo_cfg_data = json.load(open(alertinfo_cfg_file))
                logger.debug(alertinfo_cfg_data)
                queries = alertinfo_cfg_data["queries"]

                for query in queries:
                    if query["header"] == match_alert_header:
                        query["current_value"] = percent_match_value

                        logger.debug("Threshold: ", query["threshold"])
                        logger.debug("PercentMatchValue: ", percent_match_value)
                        logger.debug(query)

                        # get ready to send an alert if needed
                        if float(query["threshold"]) <= float(percent_match_value):
                            # send out an email if the percent match exceeds the threshold
                            send_email(query, alertinfo_cfg_data["email"])

                json.dump(alertinfo_cfg_data, open(alertinfo_cfg_file, 'w'))

                logger.debug("Running minimap2 was successful")
                # if the final output files already exist, append to them
                if os.path.isfile(final_output):
                    logger.debug(f"{final_output} file exits, appending onto it")

                    open(final_output, "a+").writelines([l for l in open(minimap2_output).readlines()])

                    subprocess.call(['rm', minimap2_output])

                # if final output files do not exist, move the already
                # generated output files to the appropriate location,
                # also rename them as final output respectively.
                else:
                    subprocess.call(['mv', minimap2_output, final_output])
                    logger.debug(
                        "Renaming the minimap2_output and minimap2_report files to final_output and "
                        "respectively "
                    )

                # increase the # of files it has classified
                self.num_files_classified += 1

                # Get the number of files that are in MinION reads directory
                minion_reads_dir = os.path.abspath(os.path.join(event.src_path, os.pardir))
                num_files_minion_reads = int(os.popen('ls -1 ' + minion_reads_dir + ' | wc -l').read())
        else:
            logger.debug(f"None Fasta/Fastq generated in MINION location: {event.src_path}")