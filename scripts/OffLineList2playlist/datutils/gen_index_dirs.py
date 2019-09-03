# encoding=utf8
import os


def loop_walk_dir(cur_dir):  #传入存储的list
    for root, dirs, files in os.walk(cur_dir):
        # print(root) #当前目录路径
        # print(dirs) #当前路径下所有子目录
        # print(files) #当前路径下所有非目录子文件
        if files:
            print('files: ', files)
            index_file_name = os.path.join(root, '.index')
            print('index_file_name: %s, files: %s' % (index_file_name, files))
            index_file = open(index_file_name, 'w')
            for file in files:
                index_file.write(file+'\n')
            index_file.close()
        if dirs:
            index_dirs_file_name = os.path.join(root, '.index-dirs')
            print('index_dirs_file_name: %s, dirs: %s' % (index_dirs_file_name, dirs))
            index_dirs_file = open(index_dirs_file_name, 'w')
            for subdir in dirs:
                index_dirs_file.write(subdir+'\n')
            index_dirs_file.close()


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python gen_index_dirs.py'
    parser = OptionParser(usage)
    parser.add_option("--start")

    (options, args) = parser.parse_args()

    cur_dir = '.'
    loop_walk_dir(cur_dir)
