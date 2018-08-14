'use strict';


/** Глобалки, Чтобы не мучаться с общими пакетами в разных модулях */
{
  // Основные инструменты для работы, псевдонимы и т.д.
  /** Поганый гульп */
  var gulp = require('gulp'); global.gulp=gulp;
  /** Дочерние процессы */
  var child = require('child_process'); global.child=child;
  /** Для работы с путями */
  var path = require('path'); global.path=path;
  /** Для крутой работы с путями */
  var glob = require('glob'); global.glob=glob;
  /** Для работы с файлами */
  var fs = require('fs-extra'); global.fs=fs;
  /** Быстрое чтение файла c удалением \r символов */
  var rFile = (x,en='utf8')=>{return String(fs.readFileSync(x,en)).replace(/\r/igm,'');}; global.rFile=rFile;
  /** Удаление папок и файлов */
  //var del = require('del'); global.del=del;
  /** Красочный вывод в консоль */
  var chalk = require('chalk'); global.chalk=chalk;
  // События
  //EventEmitter = require('events').EventEmitter;
  /** Да хз что это */
  var vinsors = require('vinyl-source-stream'); global.vinsors=vinsors;


  // QA - тестовый прокси, автотесты, и т.д. (а что, ещё что-нибудь есть?)
  /** HTTP сервер на локалхосте с live update */
  var browserSync = require('browser-sync'); global.browserSync=browserSync;


  // Препроцессоры, компиляторы, обфускаторы, бьютифаеры, комбобрекеры, унабомберы
  /** Импорт JS пакетов в вебстраницы с помощью npm */
  var browserify = require('browserify'); global.browserify=browserify;
  /** Stylus -> CSS */
  var stylus = require('stylus'); global.stylus=stylus;
  /** Acorn */
  var acorn = require('acorn'); global.acorn=acorn;
  /** Acorn parse */
  var acrnP = acorn.parse; global.acrnP=acrnP;
  /** Acorn walk */
  var acornWalk = require("acorn/dist/walk"); global.acornWalk=acornWalk;
  /** Acorn walk fast*/
  var acrnW = (x,c,b,s) => {return acornWalk.fullAncestor(acrnP(x),c,b,s);}; global.acrnW=acrnW;
  /** Pug -> HTML */
  var pugjs = require('pug'); global.pugjs=pugjs;
  /** Pug lexer */
  var pugLex = require('pug-lexer'); global.pugLex=pugLex;
  /** Pug parser */
  var pugParse = require('pug-parser'); global.pugParse=pugParse;
  /** Pug walk */
  var pugWalk = require('pug-walk'); global.pugWalk=pugWalk;
  /** Pug parse right from code */
  var pugP = (x) => {return pugParse(pugLex(x));}; global.pugP=pugP;
  /** Pug walk right from code*/
  var pugW = global.pugW = (x,b,a,o) => {
    if(typeof(x)==='string') return pugWalk(pugP(x),b,a,o);
    return pugWalk(x,b,a,o);};
  /** Stylus -> Beautiful Stylys */
  var stylusSupremacy = require('stylus-supremacy'); global.stylusSupremacy=stylusSupremacy;
  var stylusSupremacyFormat = global.stylusSupremacyFormat = {
    insertColons: false,
    insertSemicolons: false,
    insertBraces: false,
    //sortProperties: 'alphabetical',
    insertNewLineAroundBlocks: false
  };
  /** CSS -> офигенный CSS */
  var postcss = require('postCSS'); global.postcss=postcss;
  // Плагины к нему
  /** Postcss autoprefixer*/
  var autoprefixer = require('autoprefixer'); global.autoprefixer=autoprefixer;
  /** Postcss perfectionist */
  var perfectionist = require('perfectionist'); global.perfectionist=perfectionist;
  /** postcss-sorting */
  var csssort = require('postcss-sorting'); global.csssort=csssort;
  /** Postcss cssnano */
  var cssnano = require('cssnano'); global.cssnano=cssnano;
  /**  */
  var htmlminify = require('html-minifier').minify;


  // Псевдонимы, сокращения то бишь. Ну и прочие полезности
  /** Быстрый вывод в консоль
   * @param {String} x Строка для вывода в консоль
   * @param {String|Number} c Цвет выводимого текста (chalk), название либо порядковый номер в массиве. Dafault 'green';
  */
  var log = (x, c=1) => {
    let colors = [ 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright' , 'black'];
    if (typeof(c)==='string' && colors.includes(c)) {console.log(chalk[c](x)); return;}
    if(typeof(c)==='number' && c<colors.length) {console.log(chalk[colors[c]](x)); return;}
    console.log(x);
  }; global.log = log;
  /** Быстрый new RegExp, в нём igm по умолчанию */
  var rx = (x, f='igm') => {return new RegExp(x, f);}; global.rx=rx;
  /** Псевдоним новой строки \n */
  var nl = '\n'; global.nl=nl;
  /** Регулярка "начало строки" для всех платформ, флаги ig ^|\r\n?|\n */
  var nx = rx('^|(?:\r\n?)|(?:\n)','ig'); global.nx=nx;
  /** Псевдоним path.sep */
  var sep = path.sep; global.sep=sep;
  /** Псевдоним path.normalize(), с возможностью выбрать разделитель и обработать сразу массив строк*/
  var pnrm = (x,s) => {
    let tmp =[];
    if(Array.isArray(x))
      for(let i in x)
        tmp.push((s) ? x.replace(/[\\/]+/igm,s): path.normalize(x));
    else return (s) ? x.replace(/[\\/]+/igm,s): path.normalize(x);
    return tmp;}; global.pnrm=pnrm;
  /** Псевдоним Object.keys(), но с проверкой на undefined */
  var ky = (x) => {return (x===undefined) ? 'Object.keys(undefined)!' : Object.keys(x);}; global.ky=ky;
  /** Псевдоним JSON.stringify() с преобразованием CRLF -> LF*/
  var json = (x,en)=>{
    if (typeof(x)==='object' || typeof(x)==='function') return JSON.stringify(x).replace(/\r/igm,'');
    if (x.match(':')) return JSON.parse(x);
    else return fs.readJSONSync(x,en);
  }; global.json=json;
  /** Псевдоним Object.assign() */
  var obj = (x,y) => {return (y) ? Object.assign(x,y) : Object.assign({},x);}; global.obj=obj;
}





// Задачи




/** Watcher */
function watch(done) {
  gulp
    .watch('src/**/*.pug', {usePolling: true}, pug_to_php)
    .on("error", err => {log("Watcher error occured",0);});
  gulp
    .watch('src/**/*.styl', {usePolling: true}, styl_to_css)
    .on("error", err => {log("Watcher error occured",0);});
  done();
}


/** Styl -> CSS */
function styl_to_css(done) {
  glob.sync("src/*.styl").map((file)=>{
    fs.outputFile("build/" + path.basename(file,".styl") + ".css", stylus.render(String(fs.readFileSync(file))));
  });
  done();
}


/** Pug -> PHP */
function pug_to_php(done) {
  glob.sync("src/*.pug").map((file)=>{
    fs.outputFile("build/" + path.basename(file,".pug") + ".php", pugjs.renderFile(file));
  });
  done();
}


// Задача сборки
gulp.task('build',
  gulp.parallel(styl_to_css, pug_to_php)
);


// Default задача сборки
gulp.task('default',
  gulp.series('build', watch)
);