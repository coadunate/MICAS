from watchdog.events import FileSystemEventHandler

from flask_socketio import emit
from ... import socketio

import os, subprocess, sys

from .parse import krakenParse

import logging

logger = logging.getLogger(__name__)

class FASTQFileHandler(FileSystemEventHandler):

    def __init__(self,app_loc):
        logger.info("FASTQ FILE HANDLER INITIATED")
        self.app_loc = app_loc
        self.num_files_classified = 0

    def on_created(self, event):

        #if fastq file is created
        if event.src_path.endswith(".fasta"):

            logger.info('event type: ' + event.event_type + 'path: ' + event.src_path + 'num files classified: ' + self.num_files_classified)

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
                logger.error("ERROR: Database not found!")
                sys.exit(1)
            else:
                index_file = indices[0].split(".")[0]

            logger.debug(index_file, "DEBUG")

            cmd = 'centrifuge -x ' + index_file + ' -U ' + event.src_path  + ' -f -S ' + centrifuge_output + ' --report-file ' + centrifuge_report
            logger.debug(cmd, "DEBUG")


            proc = subprocess.Popen(cmd,shell=True,stdout=subprocess.PIPE)
            (output,err) = proc.communicate()
            proc.wait()
            logger.debug("COMMAND OUTPUT: " + str(output), "DEBUG")


            # if running centrifuge was successful
            logger.info("RUN CENT WAS SUCCESSFUL")
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
                logger.info("MOVING FILES")

            # Re-create the centrifuge kraken-style report
            run_kreport = subprocess.call([ \
                'centrifuge-kreport',
                '-x', index_file , \
                final_output,
            ],stdout=final_kreport,stderr=subprocess.DEVNULL)


            # Generate Sankey JSON data
            kraken_output = None
            with open(self.app_loc + 'centrifuge/sankey.data','w') as sankey_data_file:
                kraken_output = self.app_loc + 'centrifuge/final.out.kraken'
                kraken_sankey_report_cmd = ['/Users/tayabsoomro/software/SankeyReport.R ' + kraken_output]
                proc = subprocess.Popen(kraken_sankey_report_cmd,shell=True,stdout=subprocess.PIPE, universal_newlines=True)
                (output,err) = proc.communicate()
                proc.wait()
                logger.info("SANKEY KRAKEN COMMAND OUTPUT: " + str(output))
                sankey_data_file.write(output)


            # increase the # of files it has classified
            self.num_files_classified += 1

            # Get the number of files that are in MinION reads directory
            minion_reads_dir = os.path.abspath(os.path.join(event.src_path, os.pardir))
            num_files_minion_reads = int(os.popen('ls -1 ' + minion_reads_dir + ' | wc -l').read())

            # Update the analysis.timeline file
            with open(self.app_loc + 'analysis.timeline','w') as analysis_timeline:
                analysis_timeline.write(str(num_files_minion_reads) + \
                                        '\t' + str(self.num_files_classified))
