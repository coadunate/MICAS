pip_freeze_file = "/Users/tayabsoomro/Documents/Projects/MICAS-Coadunate/pip_freeze_output.txt"
env_file = "/Users/tayabsoomro/Documents/Projects/MICAS-Coadunate/updated_env.yml"

pip_frz_fs = open(pip_freeze_file, 'r')
env_fs = open(env_file, 'r')

for line in pip_frz_fs:
  dep = line.rstrip()
  print(dep.split("=")[1])
