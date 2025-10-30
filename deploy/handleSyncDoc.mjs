// WARN 该文件只是方便我将当前项目同步到开源仓库，其他人不需要管这个文件~
import fs from 'node:fs';
import path from 'node:path';
import trash from 'trash';

const liveDir =
  '/Users/huangshuisheng/Desktop/hss/billd-project/billd-live-pro/';

const liveAdminDir =
  '/Users/huangshuisheng/Desktop/hss/billd-project/billd-live-admin-pro/';
const liveServerDir =
  '/Users/huangshuisheng/Desktop/hss/billd-project/billd-live-server-pro/';
const liveFlutterDir =
  '/Users/huangshuisheng/Desktop/hss/billd-project/billd-live-flutter-pro/';

async function main() {
  const liveDocDir = liveDir + 'docs/';
  const liveServerDocDir = liveServerDir + 'docs/';
  const liveAdminDocDir = liveAdminDir + 'docs/';
  const liveFlutterDocDir = liveFlutterDir + 'docs/';

  await trash(liveServerDocDir);
  await trash(liveAdminDocDir);
  await trash(liveFlutterDocDir);

  await trash(liveServerDir + 'README.md');
  await trash(liveAdminDir + 'README.md');
  await trash(liveFlutterDir + 'README.md');

  const README = fs.readFileSync(liveDir + '/README.md', 'utf-8');

  fs.writeFileSync(liveServerDir + '/README.md', README);
  fs.writeFileSync(liveAdminDir + '/README.md', README);
  fs.writeFileSync(liveFlutterDir + '/README.md', README);

  function getDirAllFile(dirPath) {
    const allFile = [];
    function findFile(inputDir) {
      for (let i = 0; i < inputDir.length; i += 1) {
        const file = inputDir[i];
        const filePath = `${dirPath}${file}`;
        const stat = fs.statSync(filePath);
        const isDir = stat.isDirectory();
        if (!isDir) {
          allFile.push(filePath);
        } else {
          findFile(fs.readdirSync(filePath).map((key) => `${file}/${key}`));
        }
      }
    }
    findFile(fs.readdirSync(dirPath));
    return allFile;
  }

  const allfileArr = getDirAllFile(liveDocDir);

  function copyToDest(fileArr, destDir) {
    fileArr.forEach((url) => {
      const str = fs.readFileSync(url, 'utf-8');
      const txt1 = url.replace(liveDocDir, '');
      const desk = destDir + txt1;
      const livedir = path.dirname(desk);
      // 检查并创建目录
      if (!fs.existsSync(livedir)) {
        fs.mkdirSync(livedir, { recursive: true });
      }
      fs.writeFileSync(desk, str);
    });
  }
  copyToDest(allfileArr, liveServerDocDir);
  copyToDest(allfileArr, liveAdminDocDir);
  copyToDest(allfileArr, liveFlutterDocDir);
}

main();
