var chalk = require('chalk'),
  good = chalk.green('Ok'),
  bad = chalk.red("Bad");

var tokens = {
  generated: false
};

module.exports = function(grunt){
  require('time-grunt')(grunt);

  grunt.registerMultiTask('build_standalone_file','Gets all files and builds them', function(){
    var done = this.async();

    this.files.forEach(function (process) {
      grunt.log.subhead("Building " + chalk.cyan(process.orig.dest) + "...");
      
      var files = process.orig.src.filter(function (file) {
        if (file.ignore === true) {
          return false;
        }
        else {
          if (!grunt.file.exists(file.path)) {
            grunt.fail.fatal("  "+bad+ " "+file.path + chalk.red(" not found or does not exist!!!"));
          }
          return true;
        }
      }).map(function(file){
        var fileContent = grunt.file.read(file.path);
        grunt.log.writeln("  " + good + " " + file.path);
        return fileContent;
      }).join('\n');
      
      grunt.file.write(process.orig.dest, files);
      grunt.log.writeln("  Successfully built " + chalk.cyan(process.orig.dest) + " " + chalk.bgYellow.black(":)"));
      done();
    });
  });
  
  grunt.registerMultiTask('core', 'Gets core files and builds them', function(){
    var done = this.async();

    this.files.forEach(function (process) {
      grunt.log.subhead("Building " + chalk.cyan(process.orig.dest) + "...");
      
      var files = process.orig.src.filter(function (file) {
        if(file.module || file.ignore === true){
          return false;
        }
        else {
          if (!grunt.file.exists(file.path)) {
            grunt.fail.fatal("  "+bad+ " "+file.path + chalk.red(" not found or does not exist!!!"));
          }
          return true;
        }
      }).map(function(file){
        var fileContent = grunt.file.read(file.path);
        grunt.log.writeln("  " + good + " " + file.path);
        return fileContent;
      }).join('\n');
      
      grunt.file.write(process.orig.dest, files);
      grunt.log.writeln("  Successfully built " + chalk.cyan(process.orig.dest) + " " + chalk.bgYellow.black(":)"));
      done();
    });
  });
  
  grunt.registerMultiTask('fully','Built full version', function(){
    var done = this.async();

    this.files.forEach(function (process) {
      var files = process.orig.src.filter(function (file) {
		if(file.module === 'excel'){
		  return false;
		}
		  
        if (!grunt.file.exists(file.path)) {
          grunt.fail.fatal("  "+bad+ " "+file.path + chalk.red(" not found or does not exist!!!"));
        }
        return true;
      }).map(function(file){
        var fileContent = grunt.file.read(file.path);
        grunt.log.writeln("  " + good + " " + file.path);
        return fileContent;
      }).join('\n');
      
      grunt.file.write(process.orig.dest[0], files);
      
      grunt.log.writeln("  Successfully full built ");
      done();
    });
  });
  
  grunt.registerMultiTask('myclean','Cleaning from not min files', function(){
    var done = this.async();
    
    this.files.forEach(function (process) {
      grunt.log.subhead("Building " + chalk.cyan(process.orig.dest) + "...");
      
      var files = process.orig.src.map(function(file){
        var fileContent = grunt.file.delete(file.path);
        grunt.log.writeln("  " + good + " " + file.path);
      }).join('\n');
      
      grunt.log.writeln("Not minified files were removed " + chalk.cyan(process.orig.dest));
      done();
    });
  });
  
  /*
   angular directive
   */
  grunt.registerMultiTask('angular', 'AngularJS directive', function(){
    var done = this.async();
  
    var fileContent = grunt.file.read('./src/js/angular/fancygrid-angularjs.js');
    fileContent += '\n';
    fileContent += grunt.file.read('./src/js/angular/fancyform-angularjs.js');
    
    grunt.file.write('./fancygrid/fancy-angular.js', [fileContent]);
    done();
  });

  //Modules
  
  grunt.registerMultiTask('modules','Build modules', function(){
    var done = this.async();

    this.files.forEach(function (process) {
      var modulesCode = {};
      
      var files = process.orig.src.filter(function (file) {
        if (file.module === undefined) {
          return false;
        }
        else {
          if (!grunt.file.exists(file.path)) {
            grunt.fail.fatal("  " + bad + " "+file.path + chalk.red(" not found or does not exist!!!"));
          }
          modulesCode[file.module] = '';
          return true;
        }
      }).map(function(file){
        var fileContent = grunt.file.read(file.path);
        modulesCode[file.module] += fileContent;
        return fileContent;
      }).join('\n');
      
      for(var p in modulesCode){
        var moduleFileName = p.replace(/ /g, '-');
        grunt.file.write(process.orig.dest + moduleFileName + '.js', modulesCode[p]);
      }
      
      done();
    });
  });
  
  // PACK FILES
  grunt.registerMultiTask('pack','Pack', function () {
    var done = this.async();

    // Setup options
    var options = this.options({
      license: '',
      version: ''
    });
    
    this.files.forEach(function (process) {
      process.src.forEach(function (file) {
        grunt.log.writeln(file);
        var src = grunt.file.read(file),        
          packedContent = "/*\n"+options.license+"\n\nBuild: "+options.version+"\n*/\n\n";
        
        packedContent += src;
        
        // Write the file to it's original path (overwriting it)
        grunt.file.write(file, packedContent);
      });
      done();
    });    
  });
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('gruntConfig.json'),
    angular: {
      fancy: {

      }
    },
    modules: {
      fancy: {
        src: "<%= pkg.files %>",
        dest: "./fancygrid/modules/"
      }
    },
    core: {
      fancy: {
        src: "<%= pkg.files %>",
        dest: "./fancygrid/fancy.js"
      }
    },
    fully: {
      fancy: {
        src: "<%= pkg.files %>",
        dest: ["./fancygrid/fancy.full.js"]
      }
    },
    myclean: {
      fancy: {
        src: "<%= pkg.mfiles %>",
        dest: "./fancygrid/modules/"
      }
    },
    uglify: {
      fancy: {
        files: [{
          "./fancygrid/fancy.min.js": ["./fancygrid/fancy.js"]
        },{
          "./fancygrid/fancy.full.min.js": ["./fancygrid/fancy.full.js"]
        },{
          "./fancygrid/modules/chart-integration.min.js": ["./fancygrid/modules/chart-integration.js"]
        },{
          "./fancygrid/modules/edit.min.js": ["./fancygrid/modules/edit.js"]
        },{
          "./fancygrid/modules/paging.min.js": ["./fancygrid/modules/paging.js"]
        },{
          "./fancygrid/modules/sort.min.js": ["./fancygrid/modules/sort.js"]
        },{
          "./fancygrid/modules/touch.min.js": ["./fancygrid/modules/touch.js"]
        },{
          "./fancygrid/modules/server-data.min.js": ["./fancygrid/modules/server-data.js"]
        },{
          "./fancygrid/modules/selection.min.js": ["./fancygrid/modules/selection.js"]
        },{
          "./fancygrid/modules/spark.min.js": ["./fancygrid/modules/spark.js"]
        },{
          "./fancygrid/modules/grouped-header.min.js": ["./fancygrid/modules/grouped-header.js"]
        },{
          "./fancygrid/modules/grouping.min.js": ["./fancygrid/modules/grouping.js"]
		},{
          "./fancygrid/modules/column-drag.min.js": ["./fancygrid/modules/column-drag.js"]
        },{
          "./fancygrid/modules/summary.min.js": ["./fancygrid/modules/summary.js"]
		},{
          "./fancygrid/modules/tree.min.js": ["./fancygrid/modules/tree.js"]
        },{
          "./fancygrid/modules/filter.min.js": ["./fancygrid/modules/filter.js"]
        },{
          "./fancygrid/modules/date.min.js": ["./fancygrid/modules/date.js"]
        },{
          "./fancygrid/modules/form.min.js": ["./fancygrid/modules/form.js"]
        },{
          "./fancygrid/modules/dom.min.js": ["./fancygrid/modules/dom.js"]
        },{
          "./fancygrid/modules/ajax.min.js": ["./fancygrid/modules/ajax.js"]
        },{
          "./fancygrid/modules/dd.min.js": ["./fancygrid/modules/dd.js"]
        },{
          "./fancygrid/modules/expander.min.js": ["./fancygrid/modules/expander.js"]
        },{
          "./fancygrid/modules/menu.min.js": ["./fancygrid/modules/menu.js"]
        },{
          "./fancygrid/modules/grid.min.js": ["./fancygrid/modules/grid.js"]
		},{
          "./fancygrid/modules/exporter.min.js": ["./fancygrid/modules/exporter.js"]
		},{
          "./fancygrid/modules/state.min.js": ["./fancygrid/modules/state.js"]
		},{
          "./fancygrid/modules/excel.min.js": ["./fancygrid/modules/excel.js"]
        }]
      }
    },
    compress: {
      fancy: {
        options: {
          archive: './fancygrid/fancygrid-latest.zip',
          pretty: true,
          mode: 'zip'
        },
        files: [
          { src: './fancygrid/fancy.js' },
          { src: './fancygrid/fancy.min.js' },
      
          { src: './fancygrid/fancy.full.js' },
          { src: './fancygrid/fancy.full.min.js' },
      
          { src: './fancygrid/fancy.css' },
          { src: './fancygrid/fancy.min.css' },
          
          { src: './fancygrid/fancy-angular.js' },
          
          { src: './fancygrid/modules/**' },
          { src: './fancygrid/images/**' },
        ]
      }
    },
    pack: {
      fancy: {
        options: {
          license: "<%= pkg.license %>",
          version: "<%= pkg.version %>"
        },
        files: [
          { src: './fancygrid/fancy.min.js' },
          { src: './fancygrid/fancy.min.css' },
          { src: './fancygrid/fancy.full.min.js' }
        ]
      }
    },
    less: {
      fancy: {
        files: {
          "./fancygrid/fancy.css": ["./src/less/fancy.less"]
        }
      }
    },
    cssmin: {
      options: {
        advanced:false,
        aggressiveMerging:false,
        rebase:false,
        restructuring:false,
        shorthandCompacting:false
      },
      fancy: {
        files: {
          "./fancygrid/fancy.min.css": ["./fancygrid/fancy.css"]
        }
      }
    },
    bump: {
      options: {
        files: ['package.json', 'gruntConfig.json', './src/js/core/Fancy.js'],
        updateConfigs: [],
        commit: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'gruntConfig.json', './src/js/core/Fancy.js'],
        createTag: false,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: false,
        regExp: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-image-embed');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('dev', ['less:fancy']);
  
  grunt.registerTask('cl', [
      'myclean:fancy'
  ]);
  
  //grunt.registerTask('packer', ['pack:fancy']);
  
  //bumping - grunt bump
  //comp - grunt comp
  
  grunt.registerTask('debug', ['core:fancy', 'fully:fancy', 'dev', 'uglify:fancy', 'cssmin:fancy', 'modules', 'pack']);
  
  grunt.registerTask('css', ['less:fancy', 'cssmin:fancy']);

  //IMPORTANT - done RELEASE zip file
  grunt.registerTask('comp', ['compress:fancy']);
  
  grunt.registerTask('release', ['core:fancy', 'fully:fancy', 'dev', 'modules', 'angular:fancy', 'uglify:fancy', 'cssmin:fancy', 'cl',  'pack']);
  //grunt.registerTask('release', ['core:fancy', 'fully:fancy', 'dev', 'modules', 'angular:fancy', 'uglify:fancy', 'cl', 'comp', 'pack']);
};