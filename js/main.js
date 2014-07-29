

$(function() {

    var operators = [
        { name: '/', fn: function(a, b) { return a / b; } },
        { name: '+', fn: function(a, b) { return a + b; } },
        { name: '-', fn: function(a, b) { return a - b; } },
        { name: '*', fn: function(a, b) { return a * b; } }
        ];
    function extractChildren(remainder) {
        var children = [];
        for (var idx = 0; idx < remainder.length; idx++) {
            for (var len = 1; len <= remainder.length - idx; len++) {
                children.push({
                    val: parseInt(remainder.substr(idx, len)),
                    remainder: remainder.substr(0, idx) + remainder.substr(idx + len)
                });
            }
        }
        return children;
    }

    function calculate(currentValue, childrenDigits, history, found) {
        var children = extractChildren(childrenDigits);
        for (var childIdx = 0; childIdx < children.length; childIdx++) {
            var child = children[childIdx].val;

            // Loop over operators
            for (var operIdx = 0; operIdx < operators.length; operIdx++) {
                // Don't divide by zero!
                if (child === 0 && operIdx === 0)
                    continue;

                var oper = operators[operIdx];
                var operRes = oper.fn(currentValue, child);
                var thisHistory = history + oper.name + child;

                if (children[childIdx].remainder.length == 0) {
                    if (operRes === 10)
                        found.push(thisHistory);
                } else {
                    calculate(operRes, children[childIdx].remainder, thisHistory, found);
                }
            }
        }
    }

    function syntaxHighlight(json) {
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    $content = $('#content');

    var model = kendo.observable({

        input: '',
        output: 'Enter train number and click "go".',

        onGoClick: function(evt) {

            input = this.get('input');
            numbers = parseInt(input);

            if (input.length !== 4 || isNaN(numbers)) {
                this.set('output', 'Error: enter a 4 digit number.');
                return;
            }

            if (input.indexOf('0') !== -1) {
                this.set('output', 'Error: Number cannot contain 0.');
                return;
            }

            this.set('output', 'Calculating...');
            //console.log(calculate(parseInt(input[0]), input.substr(1), input[0]));
            var first = extractChildren(input);
            var results = [];
            for (var idx = 0; idx < first.length; idx++) {
                var child = first[idx];
                calculate(child.val, child.remainder, ''+child.val, results);
            }

            results = _.uniq(results);

            var output = 'Found ' + results.length + ' solution' + (results.length > 1 ? 's' : '') +
                ': <div class="json">' + syntaxHighlight(JSON.stringify(results, undefined, 4)) + '</div>';
            this.set('output', output);
        }

    });

    kendo.bind($content, model);

});