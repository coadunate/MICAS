from watchdog.events import FileSystemEventHandler

from flask_socketio import emit
from ... import socketio

import os, subprocess, sys

from .parse import krakenParse

class FASTQFileHandler(FileSystemEventHandler):

    def __init__(self,app_loc):
        print("FASTQ FILE HANDLER INITIATED")
        self.app_loc = app_loc

    def on_created(self, event):

        #if fastq file is created
        if event.src_path.endswith(".fasta"):

            print('event type:', event.event_type , 'path :', event.src_path)

            # paths for centrifuge out file and centrifuge report file
            centrifuge_output = self.app_loc + 'centrifuge/runs/' + os.path.basename(event.src_path) + '.out.centrifuge'
            centrifuge_report = self.app_loc + 'centrifuge/runs/' + os.path.basename(event.src_path) + '.report.tsv'

            # paths for final output file and final report file
            final_output = self.app_loc + 'centrifuge/final.out.centrifuge'
            final_report = self.app_loc + 'centrifuge/final.report.tsv'
            final_kreport = open(self.app_loc + 'centrifuge/final.out.kraken','w')

            # figuring out the index name
            import glob
            files = glob.glob(self.app_loc + 'database/*')
            indices = [x for x in files if x.endswith('cf')]
            index_file = ""

            if len(indices) < 1:
                print("ERROR: Database not found!")
                sys.exit(1)
            else:
                index_file = indices[0].split(".")[0]

            # run centrifuge classification
            run_cent = subprocess.call([ \
                'centrifuge', \
                '-x',self.app_loc + index_file, \
                '-U',event.src_path, \
                '-f', \
                '-S', centrifuge_output, \
                '--report-file', centrifuge_report, \
                ],stderr=subprocess.DEVNULL)

            # if running centrifuge was successful
            if run_cent == 0:

                # if the final report and output files already exist, append to them
                if subprocess.call(['ls',final_output]) == 0 and \
                   subprocess.call(['ls',final_report]) == 0:

                    open(final_output, "a").writelines([l for l in open(centrifuge_output).readlines()[1:]])
                    open(final_report, "a").writelines([l for l in open(centrifuge_report).readlines()[1:]])

                    subprocess.call(['rm',centrifuge_output])
                    subprocess.call(['rm',centrifuge_report])

                # if final report and output files do not exist, move the already
                # generated report and output files to the appropriate location,
                # also rename them as final report and output respectively.
                else:
                    subprocess.call(['mv',centrifuge_output,final_output])
                    subprocess.call(['mv',centrifuge_report,final_report])

                # Re-create the centrifuge kraken-style report
                run_kreport = subprocess.call([ \
                    'centrifuge-kreport',
                    '-x',self.app_loc + 'database/lambda-reference', \
                    final_output,
                ],stdout=final_kreport,stderr=subprocess.DEVNULL)

                # Generate Sankey JSON data
                kraken_output = None
                with open(self.app_loc + 'centrifuge/sankey.data','w') as sankey_data_file:
                    sankey_data_file.write(str(krakenParse(self.app_loc + 'centrifuge/final.out.kraken')) + "\n")
