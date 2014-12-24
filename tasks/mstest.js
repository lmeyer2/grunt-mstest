/*
* grunt-mstest
* https://github.com/mrjackdavis/grunt-mstest
*
* Copyright (c) 2014 mrjackdavis
* Licensed under the MIT license.
*/

'use strict';
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

// Please see the Grunt documentation for more information regarding task
// creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('mstest', 'The best mstest Grunt plugin ever.', function() {

        var done = this.async();

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            mstestPath: getExePath(),
            details:["errormessage","errorstacktrace"],
            force:false,
            resultsfile: ''
        });

        function gruntWarn(str){
            if(options.force)
                grunt.log.writeln(str);
            else
                grunt.fail.warn(str);
        }

        // Iterate over all specified file groups.
        var containerString = this.filesSrc.map(function(filePath){
            return "/testcontainer:"+filePath;
        }).join(" ");

        if (!options.resultsfile && options.resultsfile !== "")
          containerString += " /resultsfile:" + options.resultsfile;

        for (var i = options.details.length - 1; i >= 0; i--) {
            containerString += " /detail:"+options.details[i]
        };

        containerString +=" /usestderr";

        var child = exec(escapeShell(options.mstestPath) +containerString ,function (error, stdout, stderr) {
            grunt.log.writeln(stdout);

            if(!stderr && stderr !== ""){
                gruntWarn("stderr:\""+stderr+"\"",3);
            }
            if (error !== null) {
                gruntWarn(error,3);
            }

            done();
        });
    });


    function getExePath() {
        //Possible env variables for visual studio tools, in reverse order of priority
        var vsToolsArr = [process.env.VS100COMNTOOLS,process.env.VS110COMNTOOLS,process.env.VS120COMNTOOLS]

        //Get highest priority VS tools
        var vsTools = null;
        for (var i = vsToolsArr.length - 1; i >= 0; i--) {
            var item = vsToolsArr[i]
            if(item && item != ""){
                vsTools = item;
                break;
            }
        };

        if(!vsTools)
            grunt.fatal("Visual studio tools not installed")

        var exePath = path.join(vsTools, "../IDE", 'MSTest.exe');

        if (!fs.existsSync(exePath)) {
            grunt.fatal('Unable to find MSTest executable at '+exePath +" use the option 'mstestPath' to override");
        }

        return exePath;
    }

    function escapeShell(cmd) {
      return '"'+cmd+'"';
    };
};
