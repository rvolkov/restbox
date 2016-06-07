'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  var fs = require('fs');
  var url = require('url');
  var urlRewrite = function (rootDir, indexFile) {
    indexFile = indexFile || 'index.html';
    return function(req, res, next){
      var path = url.parse(req.url).pathname;
      fs.readFile('./' + rootDir + path, function(err){
        if(!err) { return next(); }
        fs.readFile('./' + rootDir + '/' + indexFile, function (error, buffer) {
          if(error) { return next(error); }
          var resp = {
            headers: {
              'Content-Type': 'text/html',
              'Content-Length': buffer.length
            },
            body: buffer
          };
          res.writeHead(200, resp.headers);
          res.end(resp.body);
        }
        );
      }
      );
    };
  };
  grunt.initConfig({
    // Project settings
    ddmng: {
      // configurable paths
      app: require('./bower.json').appPath || 'app'
    },
    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['bowerInstall']
      },
      js: {
        files: ['<%= alisav %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= alisav %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= alisav %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729,
        base: 'app',
        middleware: function(connect) {
          return [
            urlRewrite('app', 'index.html'),
            connect.static('app'),
            connect.directory('app')
          ];
        }
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= alisav %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= alisav %>'
          ]
        }
      }
    },
    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= alisav %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },
    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });
  grunt.registerTask('serve', function () {
      grunt.task.run([
          'connect:livereload',
          'watch'
        ]
      );
    }
  );
  grunt.registerTask('test', [
      'connect:test',
      'karma'
    ]
  );
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.registerTask('default', [
      'newer:jshint',
      'test',
      'connect'
    ]
  );
};
