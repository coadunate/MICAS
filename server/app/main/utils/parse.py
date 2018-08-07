#!/usr/bin/env python3

import sys, subprocess, os, json, re, os.path

def krakenReadCount(kraken_file,tax_id):
    if not os.path.exists(kraken_file):
        return None
    matches = \
        [re.findall(r'([0-9]{1,}.[0-9]{1,})\t[0-9]{1,}\t([0-9]{1,})\t[A-Z\-]\t([0-9]{1,})[\t\s]{0,}([A-z.\w\s]{1,})'\
        ,line) for line in open(kraken_file)]
    match_list = [item for sublist in matches for item in sublist]

    # LIST FORMAT
    # ('6.00', '600', '0', 'unclassified\n')
    # ('94.00', '0', '1', 'root\n')
    # ('94.00', '0', '131567', 'cellular organisms\n')
    # ('94.00', '0', '2', 'Bacteria\n')
    # ('94.00', '0', '1783272', 'Terrabacteria group\n')
    # ('94.00', '0', '1239', 'Firmicutes\n')
    # ('94.00', '0', '91061', 'Bacilli\n')
    # ('94.00', '0', '1385', 'Bacillales\n')
    # ('94.00', '0', '186817', 'Bacillaceae\n')
    # ('94.00', '0', '1386', 'Bacillus\n')
    # ('94.00', '0', '86661', 'Bacillus cereus group\n')
    # ('94.00', '3463', '1392', 'Bacillus anthracis\n')
    # ('58.71', '5871', '198094200', 'B.anthracis Ames Coadunate\n')
    # ('0.66', '66', '191218100', 'B.anthracis A')

    if match_list != []:
        for i in match_list:
            if int(i[2]) == tax_id:
                # taxid, num_reads, name
                return [int(i[2]),int(i[1]),i[3]]


def krakenParse(kraken_file):
    with open(kraken_file,'r') as report_file:

        unclassified = []
        nodes = []
        root_node = None
        domains = []
        for num,line in enumerate(report_file,1):
            parsed_line = line.strip().split('\t')
            if 'unclassified' in parsed_line:
                unclassified.append(parsed_line)
            elif 'root' in parsed_line:
                root_node = parsed_line
            else:
                if(parsed_line[3] == 'D'):
                    domains.append(num-1)
            nodes.append(parsed_line)

        # If there is nothing in kraken report
        if root_node == None and len(nodes) == 1:
            return None


        domains.append(len(nodes))
        # print(domains)

        final_nodes = []
        for i in range(len(domains)):
            if i < len(domains)-1:
                final_nodes.append(nodes[domains[i]:domains[i+1]])
        # print(final_nodes)

        names = [[ y[5].strip() for y in x] for x in final_nodes]
        links = []
        for i in range(len(names)):
            one_link = []
            for j in range(len(names[i])):
                if j < len(names[i])-1:
                    one_link.append([j,j+1])
            links.append(one_link)

        final_links = []
        final_links.append(links[0])
        for m in range(1,len(links)):
            last_val = links[m][-1][1]
            list = [x+last_val+1 for x in [item for sublist in links[m] for item in sublist]]
            new_list = [ x for x in [ list[x+2:x+4] for x in range(-2,len(list),2) ] if x]
            final_links.append(new_list)

        final_links = [x for x in [item for sublist in final_links for item in sublist]]

        combined_names = [x for x in[item for sublist in names for item in sublist]]

        json_nodes = []
        for name in combined_names:
            ind_json = {}
            ind_json['name'] = name
            json_nodes.append(ind_json)

        json_links = []
        for link  in final_links:
            # print(link)
            ind_json = {}
            ind_json['source'] = link[0]
            ind_json['target'] = link[1]
            ind_json['value'] = 20
            json_links.append(ind_json)

        return json_nodes, json_links

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit("ERROR: You need to provide the kraken output file")
    print(krakenParse(sys.argv[1]))
