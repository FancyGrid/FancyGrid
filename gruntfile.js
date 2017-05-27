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
	
    var fileContent = grunt.file.read('./src/js/angular/client-angularjs.js');
    fileContent += '\n';
    fileContent += grunt.file.read('./src/js/angular/fancyform-angularjs.js');
    
    grunt.file.write('./client/fancy-angular.js', [fileContent]);
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
        dest: "./client/modules/"
      }
    },
    core: {
			fancy: {
				src: "<%= pkg.files %>",
				dest: "./client/fancy.js"
			}
		},
    fully: {
      fancy: {
				src: "<%= pkg.files %>",
				dest: ["./client/fancy.full.js"]
			}
    },
    myclean: {
			fancy: {
				src: "<%= pkg.mfiles %>",
				dest: "./client/modules/"
			}
		},
		uglify: {
			fancy: {
				files: [{
          "./client/fancy.min.js": ["./client/fancy.js"]
        },{
          "./client/fancy.full.min.js": ["./client/fancy.full.js"]
        },{
          "./client/modules/chart-integration.min.js": ["./client/modules/chart-integration.js"]
        },{
          "./client/modules/edit.min.js": ["./client/modules/edit.js"]
        },{
          "./client/modules/paging.min.js": ["./client/modules/paging.js"]
        },{
          "./client/modules/sort.min.js": ["./client/modules/sort.js"]
        },{
          "./client/modules/touch.min.js": ["./client/modules/touch.js"]
        },{
          "./client/modules/server-data.min.js": ["./client/modules/server-data.js"]
        },{
          "./client/modules/selection.min.js": ["./client/modules/selection.js"]
        },{
          "./client/modules/spark.min.js": ["./client/modules/spark.js"]
        },{
          "./client/modules/grouped-header.min.js": ["./client/modules/grouped-header.js"]
        },{
          "./client/modules/grouping.min.js": ["./client/modules/grouping.js"]
        },{
          "./client/modules/filter.min.js": ["./client/modules/filter.js"]
        },{
          "./client/modules/date.min.js": ["./client/modules/date.js"]
        },{
          "./client/modules/form.min.js": ["./client/modules/form.js"]
        },{
          "./client/modules/dom.min.js": ["./client/modules/dom.js"]
        },{
          "./client/modules/ajax.min.js": ["./client/modules/ajax.js"]
        },{
          "./client/modules/dd.min.js": ["./client/modules/dd.js"]
        },{
          "./client/modules/expander.min.js": ["./client/modules/expander.js"]
        },{
          "./client/modules/menu.min.js": ["./client/modules/menu.js"]
        },{
          "./client/modules/grid.min.js": ["./client/modules/grid.js"]
				}]
			},
		},
    compress: {
      fancy: {
        options: {
          archive: './client/client-latest.zip',
          pretty: true,
          mode: 'zip'
        },
        files: [
          { src: './client/fancy.min.js' },
          { src: './client/fancy.full.min.js' },
          { src: './client/fancy.min.css' },
          
          { src: './client/client-angularjs.js' },
          { src: './client/fancy-angular.js' },
          
          { src: './client/modules/**' },
          { src: './client/images/**' },
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
          { src: './client/fancy.min.js' },
          { src: './client/fancy.min.css' },
          { src: './client/fancy.full.min.js' }
        ]
      }
		},
    less: {
      fancy: {
        files: {
          "./client/fancy.css": ["./src/less/fancy.less"]
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
          "./client/fancy.min.css": ["./client/fancy.css"]
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