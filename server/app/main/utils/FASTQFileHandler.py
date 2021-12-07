from watchdog.events import FileSystemEventHandler

from flask_socketio import emit
from ... import socketio

import os, subprocess, sys

from .parse import krakenParse

import logging

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
            minimap2_report = self.app_loc + 'minimap2/runs/' + os.path.basename(event.src_path) + '.report.tsv'

            # paths for final output file and final report file
            final_output = self.app_loc + 'minimap2/final.out.paf'
            final_kreport = open(self.app_loc + 'minimap2/final.out.kraken', 'w')

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
            if subprocess.call(['ls', final_output]) == 0:

                open(final_output, "a").writelines([l for l in open(minimap2_output).readlines()[1:]])

                subprocess.call(['rm', minimap2_output])
                subprocess.call(['rm', minimap2_report])

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

            # Update the analysis.timeline file
            with open(self.app_loc + 'analysis.timeline', 'w') as analysis_timeline:
                analysis_timeline.write(str(num_files_minion_reads) + '\t' + str(self.num_files_classified))
