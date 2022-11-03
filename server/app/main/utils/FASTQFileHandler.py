import json
import logging
import os
import subprocess
import sys

from watchdog.events import FileSystemEventHandler
from .LinuxNotification import LinuxNotification

# from .LinuxNotification import LinuxNotification

logger = logging.getLogger('micas')

class FASTQFileHandler(FileSystemEventHandler):

    def __init__(self, app_loc):
        self.app_loc = app_loc
        self.num_files_classified = 0
    # This should be covered ny on_any_event but isn't for some reason
    def on_moved(self, event):
        self.on_any_event(event)

    def on_any_event(self, event):
        # if fasta file is created
        if event.src_path.endswith(".fastq") or event.src_path.endswith(".fasta"):
            logger.debug(f'Debug: File Event ({str(event.event_type)}), Path: {str(event.src_path)}')

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
                logger.error("Error: Database not found! No MMI files found at database location")
                sys.exit(1)
            else:
                index_file = indices[0]

            cmd = 'minimap2 ' + index_file + ' ' + event.src_path + ' -o ' + minimap2_output

            proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
            proc.wait()

            # if running minimap2 was successful
            if os.path.exists(minimap2_output) <= 0:
                logger.error(f"Error: Was unable to create minimap2 alignment of {index_file} with minimap2 command {cmd}")
                return
            else:

                # see which alert sequence this new data matches to and update its percent match value
                # get the name of the header of alert sequence it matches to
                #TODO Remove use of awk
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
                device = alertinfo_cfg_data["device"]
                logger.debug(f"Debug: Minimap2 Alignment ({event.src_path}), Header: {match_alert_header}, Matchs: {num_match}, Total Length: {tot_len}, % Match: {percent_match_value}")
               
                for query in queries:
                    # Needs subsring logical match as the query header tends to be longer than the match alert header (which is the ascension number)
                    if match_alert_header in query["header"] :
                        query["current_value"] = percent_match_value
                        # get ready to send an alert if needed
                        if float(query["threshold"]) <= float(percent_match_value):
                            alert_str = f"Alert: The named taxa {query['name']} was detected to be at a concentration of {float(percent_match_value):.4f} for all sequence seen. This is above the set threshold of {float(query['threshold']):.4f}"
                            logger.critical(alert_str)
                            if len(device) > 0:
                                LinuxNotification.send_notification(device,alert_str)
                            
                            


                json.dump(alertinfo_cfg_data, open(alertinfo_cfg_file, 'w'))

                logger.debug("Debug: Minimap2 was successful")
                # if the final output files already exist, append to them
                if os.path.isfile(final_output):
                    logger.debug(f"Debug: {final_output} file exits, appending onto it")

                    open(final_output, "a+").writelines([l for l in open(minimap2_output).readlines()])

                    # Deletes the minimap2 temp file runs
                    # subprocess.call(['rm', minimap2_output])

                # if final output files do not exist, move the already
                # generated output files to the appropriate location,
                # also rename them as final output respectively.
                else:
                    logger.debug(f"Debug: Starting minimap2 file renaming.")
                    subprocess.call(['mv', minimap2_output, final_output])                

                # increase the # of files it has classified

                self.num_files_classified += 1

                # Get the number of files that are in MinION reads directory
                minion_reads_dir = os.path.abspath(os.path.join(event.src_path, os.pardir))
                num_files_minion_reads = int(os.popen('ls -1 ' + minion_reads_dir + ' | wc -l').read())
        else:
            logger.debug(f"Debug: None Fasta/Fastq generated in MINION location: {event.src_path}")
