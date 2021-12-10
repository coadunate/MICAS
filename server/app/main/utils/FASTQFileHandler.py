from watchdog.events import FileSystemEventHandler

from flask_socketio import emit
from ... import socketio

import os, subprocess, sys

from .parse import krakenParse

import logging, time

logger = logging.getLogger()


class FASTQFileHandler(FileSystemEventHandler):

    def __init__(self, app_loc):
        print("FASTQ FILE HANDLER INITIATED")
        self.app_loc = app_loc
        self.num_files_classified = 0

    def on_created(self, event):

        # if fasta file is created
        if event.src_path.endswith(".fasta"):

            print(
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
                print("ERROR: Database not found!")
                sys.exit(1)
            else:
                index_file = indices[0]

            cmd = 'minimap2 ' + index_file + ' ' + event.src_path + ' -o ' + minimap2_output
            logger.debug(cmd, "DEBUG")

            proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
            (output, err) = proc.communicate()
            proc.wait()
            print("COMMAND OUTPUT: " + str(output), "DEBUG")

            # if running minimap2 was successful
            print("Running minimap2 was successful")
            # if the final output files already exist, append to them
            if os.path.isfile(final_output):
                print(f"{final_output} file exits, appending onto it")

                open(final_output, "a+").writelines([l for l in open(minimap2_output).readlines()])

                subprocess.call(['rm', minimap2_output])

            # if final output files do not exist, move the already
            # generated output files to the appropriate location,
            # also rename them as final output respectively.
            else:
                subprocess.call(['mv', minimap2_output, final_output])
                print(
                    "Renaming the minimap2_output and minimap2_report files to final_output and "
                    "respectively "
                )

            # increase the # of files it has classified
            self.num_files_classified += 1

            # Get the number of files that are in MinION reads directory
            minion_reads_dir = os.path.abspath(os.path.join(event.src_path, os.pardir))
            num_files_minion_reads = int(os.popen('ls -1 ' + minion_reads_dir + ' | wc -l').read())


