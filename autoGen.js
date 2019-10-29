const fs = require('fs');
const path = require('path');


// 成员
const members = {
  // 李松峰
  cncuckoo: {
    github: 'https://github.com/cncuckoo',
    desc: 'Advisory Committee Representative（顾问委员会代表）',
  },
  // 刘观宇
  liuguanyu: {
    github:'https://github.com/liuguanyu',
    desc: 'CSS Working Group',
  },
  // 安佳
  anjia: {
    github: 'https://github.com/anjia',
    desc: 'CSS Working Group',
  },
  // 高峰
  verymuch: {
    github: 'https://github.com/verymuch',
    desc: 'Web of Things Working Group',
  },
  // 刘博文
  berwin: {
    github: 'https://github.com/Berwin',
    desc: 'Web Performance Working Group',
  },
  // 李喆明
  lizheming: {
    github: 'https://github.com/lizheming',
  },
  // 刘冰晶
  betseyliu: {
    github: 'https://github.com/betseyliu',
  },
  // 何文力
  nimitzdev: {
    github: 'https://github.com/NimitzDEV',
  },
  songworld: {
    github: 'https://github.com/songworld',
    desc: 'Automative Working Group',
  },
  francisfeng: {
    github: 'https://github.com/francisfeng',
    desc: 'Automative Working',
  }
}

// 前成员
const formerMembers = {
  // 黄小璐
  huangxiaolu: {
    github: 'https://github.com/huangxiaolu',
    desc: 'Web Performance Working Group',
  },
  chunpu: {
    github:'https://github.com/chunpu',
    desc: 'Browser Testing and Tools Working Group',
  },
   // 刘宇晨
   liuyuchenzh: {
    github:'https://github.com/liuyuchenzh',
    desc: 'Web Performance Working Group',
  },
}

const articlesDir = path.resolve(__dirname, './articles');

function readDir(dir) {
  return fs.readdirSync(dir, (err, files) => {
    if(err) throw err;
    return files;
  })
}

function rename (path, fileName) {
  const newFileName = fileName.replace(/ /g, '_');
  fs.rename(`${path}/${fileName}`, `${path}/${newFileName}`, function(err) {
      if (err) {
          throw err;
      }
  });
  return newFileName;
}

function getArticlesInfo(dir) {
  const articlesInfo = [];

  let files = readDir(dir);

  files.forEach(file => {
    const execReg = /^(\d{8})[-_]([^_]+)[-_](.+)(?:.md)$/;
    let [fileName, date, writer, articleName] = execReg.exec(file);
    fileName = rename(articlesDir, fileName);
    articlesInfo.push({
      fileName,
      date,
      articleName: articleName.replace(/_/g, ' '),
      writer: writer.toLowerCase(),
    });
  })

  return articlesInfo.sort((a, b) => b.date - a.date);
}


function spliceMemberInfo(members) {
  return Object.entries(members)
    .map(([member, info]) => {
      return `
- [@${member}](${info.github})${info.desc ? ' ,' + info.desc : ''}`
    }).join(' ')
}

// 拼接信息
function spliceInfo() {
  const forword = `
本项目记录 360 W3C 工作组参与 Web 标准制定过程中的各项产出。

360 自 2012 年加入 W3C（World Wide Web Consortium，万维网联盟，又称 W3C 理事会）成为正式会员。2015 年 8 月，W3C 会员事务由浏览器部门移交到 Web 平台部奇舞团（360 最大前端团队）。

经过一段时间调研和准备，2018 年初，在 360 技术委员会前端分会支持下，360 W3C 工作组正式成立。目前成员主要来自 360 各前端团队，同时也向各大业务线开放。

为了让广大同行及社会公众更好地了解 360 参与 W3C 标准制定的情况，吸引更多对 Web 标准感兴趣、有研究，愿意贡献力量的小伙伴参与，我们创建了这个项目。
  `
  const currentMemberInfo = spliceMemberInfo(members);
  const formerMemberInfo = spliceMemberInfo(formerMembers);
  
  const contribute = `
- [CSS Working Group](https://github.com/75team/w3c/blob/master/contributions/CSS_WG.md)
- [Web Performance Working Group](https://github.com/75team/w3c/blob/master/contributions/WebPerf_WG.md)
- [WoT Working Group](https://github.com/75team/w3c/blob/master/contributions/WoT_WG.md)
  `

  const articles = getArticlesInfo(articlesDir)
    .map(({fileName, date, articleName, writer}, index) => {
      return `
1. [${articleName}](/articles/${fileName})（${date} [@${writer}](${members[writer] ? members[writer].github : false || formerMembers[writer] ? formerMembers[writer].github : ''})) `
    }).join(' ');

  const copyright = `
>
> 本项目下所有文章均为 360 公司 W3C 工作组成员原创作品。如需转载，请务必先联系：lsf.email@gmail.com，取得授权后再转载。转载时也必须遵循创意共享的惯例，注明文章的作者和出处（即本页面或文章页面）。
>
> 谢谢合作！
  `;

  return `
## 360 W3C 工作组
${forword}

## 成员
${currentMemberInfo}


## 前成员
${formerMemberInfo}


## 贡献
${contribute}


## 文章
${articles}


> **版权声明**
${copyright}
  `
}

fs.writeFile('./README.md', spliceInfo(), function(err){
  if(err) throw err;
  console.log('更新成功');
})