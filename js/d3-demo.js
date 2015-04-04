var demoBox = byId('demo-box');
var demoBoxContents = byId('demo-box-contents');
var demoBoxRun = byId('demo-box-run');
var demoBoxClear = byId('demo-box-clear');
var demoBoxClose = byId('demo-box-close');

window.currentRunFunction = null;

function shuffle(a,b,c,d){//array,placeholder,placeholder,placeholder
    c=a.length;while(c)b=Math.random()*(--c+1)|0,d=a[c],a[c]=a[b],a[b]=d
}
function byId(id) { return document.getElementById(id); }
function rnd100() { return 20 + Math.floor(Math.random() * 100 + 0.5); }

function generateSample() {
    var amountToGenerate = 2 + Math.floor(Math.random()*5);

    var sampleData = [
        { "name": "Foo", "value": rnd100(), "perimeterRatio": 4.55 },
        { "name": "Bar", "value": rnd100(), "perimeterRatio": 4 },
        { "name": "Baz", "value": rnd100(), "perimeterRatio": 3.81 },
        { "name": "Qux", "value": rnd100(), "perimeterRatio": 3.72 },
        { "name": "Corge", "value": rnd100(), "perimeterRatio": 3.72 }
    ];
    sampleData = sampleData.slice(0, amountToGenerate);
    shuffle(sampleData);
    return sampleData;
}

function setupDemo(prefix, execute, startLine, endLine) {
    var pre;
    var div = byId(prefix);

    var codeContents = execute.toString();
    if (startLine != null && endLine != null) {
        codeContents = codeContents
            .split("\n")
            .slice(startLine, endLine)
            .join("\n");
    }

    addCode();

    Reveal.sync();

    function runThing(ev) {
        ev.defaultPrevented = true;
        ev.preventDefault();

        demoBoxContents.innerHTML = '';
        showBox();
        currentRunFunction = execute.bind(this, demoBoxContents);
        currentRunFunction();
    }

    function addCode() {
        pre = document.createElement('pre');
        div.appendChild(pre);

        var code = document.createElement('code');
        pre.appendChild(code);
        code.classList.add('demo-code');
        code.innerHTML = codeContents;
        if (window.hljs)
            hljs.highlightBlock(code);
        code.addEventListener('dblclick', runThing);
    }
}

function showBox() {
    demoBox.classList.remove('demo-box-hide');
}
function hideBox() {
    demoBox.classList.add('demo-box-hide');
    currentRunFunction = null;
}

demoBoxClose.addEventListener('click', hideBox);
demoBoxRun.addEventListener('click', function() {
    if (currentRunFunction)
        currentRunFunction();
});
demoBoxClear.addEventListener('click', function() {
    demoBoxContents.innerHTML = '';
});

setupDemo('simple-demo', function (containerElement) {
    var selection = d3.select(containerElement)
        .selectAll("div")
        .data(generateSample());

    selection.enter()
        .append("div")
            .text(function(d) { return d.name; })
            .style('background', 'red')
            .style('width', function(d) { return (3*d.value)+ "px" });

    selection.exit().remove();
});

setupDemo('simple-demo-binding', function (containerElement) {
    var selection = d3.select(containerElement)
        .selectAll("div")
        .data(generateSample(), function(d) { return d.name; });

    selection.enter()
        .append("div")
        .text(function(d) { return d.name; })
        .style('background', 'red')
        .style('width', function(d) { return (3*d.value)+ "px" });

    selection.exit().remove();
}, 1, 4);

setupDemo('enter-exit-transitions', function (containerElement) {
    var selection = d3.select(containerElement)
        .selectAll("div")
        .data(generateSample(), function(d) { return d.name; });

    selection.enter()
        .append("div")
            .text(function(d) { return d.name; })
            .style('background', 'red')
            .style('opacity', 0.2)
            .style('width', 0)
            .transition().duration(500)
                .style('opacity', 1)
                .style('width', function(d) { return (3*d.value)+ "px"; });

    selection.exit()
        .transition().duration(500)
        .style('opacity', 0)
        .remove();
}, 5, -1);

setupDemo('update-transitions-bad', function(containerElement) {
    var selection = d3.select(containerElement)
        .selectAll("div")
        .data(generateSample(), function(d) { return d.name; });

    selection.transition().duration(500)
        .style('width', function(d) { return (3*d.value)+ "px"; });

    selection.enter()
        .append("div")
            .text(function(d) { return d.name; })
            .style('background', 'red')
            .style('opacity', 0.2)
            .style('width', 0)
            .transition().duration(500)
                .style('opacity', 1);

    selection.exit()
        .transition().duration(500)
        .style('opacity', 0)
        .remove();
}, 5, -1);

setupDemo('update-transitions', function(containerElement) {
    var selection = d3.select(containerElement)
        .selectAll("div")
        .data(generateSample(), function(d) { return d.name; });

    selection.transition().duration(500)
        .style('width', function(d) { return (3*d.value)+ "px"; });

    selection.enter()
        .append("div")
            .text(function(d) { return d.name; })
            .style('background', 'red')
            .style('opacity', 0.2)
            .style('width', 0)
            .transition().duration(500)
                .style('opacity', 1)
                .style('width', function(d) { return (3*d.value)+ "px"; });

    selection.exit()
        .transition().duration(500)
            .style('opacity', 0)
            .remove();
}, 5, -1);