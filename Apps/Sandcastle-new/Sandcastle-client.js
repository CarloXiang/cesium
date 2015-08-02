(function (){
    "use strict";
    /*global console,Sandcastle,window*/
    function defined(value) {
        return value !== undefined;
    }

    console.originalLog = console.log;
    console.log = function(d1) {
        // console.originalLog.apply(console, arguments);
        window.parent.postMessage({
            'log' : defined(d1) ? d1.toString() : 'undefined'
        }, '*');
    };

    console.originalWarn = console.warn;
    console.warn = function(d1) {
        // console.originalWarn.apply(console, arguments);
        window.parent.postMessage({
            'warn' : defined(d1) ? d1.toString() : 'undefined'
        }, '*');
    };

    console.originalError = console.error;
    console.error = function(d1) {
        // console.originalError.apply(console, arguments);
        if (!defined(d1)) {
            window.parent.postMessage({
                'error' : 'undefined'
            }, '*');
            return;
        }

        // Look for d1.stack, "bucket.html:line:char"
        var lineNumber = -1;
        var errorMsg = d1.toString();
        if (typeof d1.stack === 'string') {
            var stack = d1.stack;
            var pos = stack.indexOf(Sandcastle.bucket);
            if (pos < 0) {
                pos = stack.indexOf('<anonymous>');
            }
            if (pos >= 0) {
                var lineStart = stack.indexOf(':', pos);
                if (lineStart > pos) {
                    var lineEnd1 = stack.indexOf(':', lineStart + 1);
                    var lineEnd2 = stack.indexOf('\n', lineStart + 1);
                    if (lineEnd2 > lineStart && (lineEnd2 < lineEnd1 || lineEnd1 < lineStart)) {
                        lineEnd1 = lineEnd2;
                    }
                    if (lineEnd1 > lineStart) {
                        try {
                            lineNumber = parseInt(stack.substring(lineStart + 1, lineEnd1), 10);
                        } catch (ex) {
                        }
                    }
                }
            }
        }

        if (lineNumber >= 0) {
            window.parent.postMessage({
                'error' : errorMsg,
                'lineNumber' : lineNumber
            }, '*');
        } else {
            window.parent.postMessage({
                'error' : errorMsg
            }, '*');
        }
    };

    window.onerror = function(errorMsg, url, lineNumber) {
        if (defined(lineNumber)) {
            if (defined(url) && url.indexOf(Sandcastle.bucket) > -1) {
                // if the URL is the bucket itself, ignore it
                url = '';
            }
            if (lineNumber < 1) {
                // Change lineNumber to the local one for highlighting.
                try {
                    var pos = errorMsg.indexOf(Sandcastle.bucket + ':');
                    if (pos < 0) {
                        pos = errorMsg.indexOf('<anonymous>');
                    }
                    if (pos >= 0) {
                        pos += 12;
                        lineNumber = parseInt(errorMsg.substring(pos), 10);
                    }
                } catch (ex) {
                }
            }
            window.parent.postMessage({
                'error' : errorMsg,
                'url' : url,
                'lineNumber' : lineNumber
            }, '*');
        } else {
            window.parent.postMessage({
                'error' : errorMsg,
                'url' : url
            }, '*');
        }
        // console.originalError.apply(console, [errorMsg]);
        return false;
    };
}());