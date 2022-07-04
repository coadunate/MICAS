import json
import logging
import os
import subprocess
import sys

from watchdog.events import FileSystemEventHandler

from .LinuxNotification import LinuxNotification

logger = logging.getLogger()

class FASTQFileHandler(FileSystemEventHandler):

    def __init__(self, app_loc):
        logger.debug("FASTQ FILE HANDLER INITIATED")
        self.app_loc = app_loc
        self.num_files_classified = 0
        LinuxNotification().test_connection()

    # This should be covered ny on_any_event but isn't for some reason
    def on_moved(self, event):
        self.on_any_event(event)

    def on_any_event(self, event):
        # if fasta file is created
        if event.src_path.endswith(".fastq") or event.src_path.endswith(".fasta"):
            logger.debug(
                '\nNEW FILE EVENT: \nEvent Type: ' + str(event.event_type) + '\npath: ' + str(
                    event.src_path) + '\nnum files classified: ' + str(self.num_files_classified) + "\n") #TODO Clean this up (Looks gross in log file)

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
            logger.debug(cmd)

            proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
            proc.wait()

            # if running minimap2 was successful
            if os.path.exists(minimap2_output) <= 0:
                logger.error(f"An error has occured in the minimap2 alignment of {index_file}")
                return
            else:

                # see which alert sequence this new data matches to and update its percent match value
                # get the name of the header of alert sequence it matches to
                #TODO Remove use of awk
                minimap2_output_line = os.popen('awk "{print $1}" ' + minimap2_output).read().strip().split("\t")
                match_alert_header = minimap2_output_line[5]

                # Calculate the new percent threshold
                num_match = int(minimap2_output_line[9])
                tot_len = int(minimap2_output_line[6])
                percent_match_value = (num_match / tot_len) * 100

                # Add the new calculated value to the alert threshold
                alertinfo_cfg_file = os.path.join(self.app_loc, 'alertinfo.cfg')
                alertinfo_cfg_data = json.load(open(alertinfo_cfg_file))
                queries = alertinfo_cfg_data["queries"]
                logger.debug(f"Minimap2 Alignment Info For {event.src_path}:\nheader: {match_alert_header}\nmatchs: {num_match}\ntotal lenght: {tot_len}\n% match: {percent_match_value}")
               
                for query in queries:
                    # Needs subsring logical match as the query header tends to be longer than the match alert header (which is the ascension number)
                    if match_alert_header in query["header"] :
                        query["current_value"] = percent_match_value
                        threshold = query["threshold"]
                        logger.debug(f"Threshold: {threshold}")
                        logger.debug(f"PercentMatchValue: {percent_match_value}")
                        logger.debug(query)

                        # get ready to send an alert if needed
                        if num_match >= int(query["threshold"]): #TODO remove overload
                        # if float(query["threshold"]) <= float(percent_match_value):

                            # send out an email if the percent match exceeds the threshold
                            LinuxNotification().test_connection()

                json.dump(alertinfo_cfg_data, open(alertinfo_cfg_file, 'w'))

                logger.debug("Running minimap2 was successful")
                # if the final output files already exist, append to them
                if os.path.isfile(final_output):
                    logger.debug(f"{final_output} file exits, appending onto it")

                    open(final_output, "a+").writelines([l for l in open(minimap2_output).readlines()])

                    # Deletes the minimap2 temp file runs
                    # subprocess.call(['rm', minimap2_output])

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