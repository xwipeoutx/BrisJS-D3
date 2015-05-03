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
function rnd(max, min) { return (isNaN(min) ? 20 : min) + Math.floor(Math.random() * (isNaN(max) ? 100 : max) + 0.5); }

function generateSample() {
    var amountToGenerate = 2 + Math.floor(Math.random()*6);

    var sampleData = [
        randomPerson("Albert"),
        randomPerson("Bruce"),
        randomPerson("Cathryn"),
        randomPerson("Denise"),
        randomPerson("Edmund"),
        randomPerson("Frank")
    ];
    sampleData = sampleData.slice(0, amountToGenerate);
    shuffle(sampleData);
    return sampleData;

    function randomPerson(name) {
        return {
            name: name,
            os: rnd(100) > 50 ? 'Windows' : rnd(100) > 50 ? "Mac" : "Linux",
            commits: rnd(100, 20),
            test: rnd(100, 20),
            height: rnd(150, 190),
            weight: rnd(70, 120)
        };
    }
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

function selectAndBind(containerElement) {
    return d3.select(containerElement)
        .selectAll('div.person')
        .data(generateSample(), function(p) { return p.name });
}

setupDemo('selection', function(containerElement) {
    var selection = d3.select(containerElement)
        .selectAll('div.person');
});

setupDemo('data-binding', function(containerElement) {
    var selection = d3.select(containerElement)
        .selectAll('div.person')
        .data(generateSample(), function(p) { return p.name });
});

setupDemo('data-enter-exit', function(containerElement) {
    var selection = selectAndBind(containerElement);
    selection
        .enter().append('div')
        .attr('class', 'person')
        .text(function(p) { return p.name + " has " + p.commits + " commits"; });
    selection.exit().remove();
});

setupDemo('data-enter-update-exit', function(containerElement) {
    var selection = selectAndBind(containerElement);
    selection
        .enter().append('div')
        .attr('class', 'person');

    selection.exit().remove();

    selection
        .text(function(p) { return p.name + " has " + p.commits + " commits"; });
});

setupDemo('data-transitions', function(containerElement) {
    var selection = selectAndBind(containerElement);
    selection
        .enter().append('div')
        .attr('class', 'person')
        .style('opacity', 0);

    selection.exit()
        .transition().duration(500)
        .style('opacity', 0)
        .remove();

    selection
        .text(function(p) { return p.name + " has " + p.commits + " commits"; })
        .transition().duration(500)
        .style('opacity', 1);
}, 1, -1);

setupDemo('scale-numerical', function(containerElement) {
    var scale = d3.scale.linear()
        .domain([50, 200])
        .range([500, 2000]);

    scale(50); // 500
    scale(150); // 1500
    scale(200); // 2000
    scale(500); // 5000
}, 1);

setupDemo('scale-ordinal-points', function(containerElement) {
    var scale = d3.scale.ordinal()
        .domain(['Foo', 'Bar', 'Baz', 'Qux'])
        .rangePoints([0, 2000], 1);

    scale('Foo'); // 250
    scale('Bar'); // 750
    scale('Baz'); // 1250
    scale('Baz'); // 1750
}, 1);

setupDemo('scale-ordinal-rangeband', function(containerElement) {
    var scale = d3.scale.ordinal()
        .domain(['Foo', 'Bar', 'Baz', 'Qux'])
        .rangeBands([0, 2100], 0.2);

    scale('Foo'); // 100
    scale('Bar'); // 600
    scale('Baz'); // 110
    scale.rangeBand(); // 400
}, 1);

setupDemo('demo-bar', function(containerElement) {
    var data = generateSample();

    var nameDomain = data.map(function(p) { return p.name; });
    var osDomain = data.map(function(p) { return p.os; });
    var commitCounts = data.map(function(p) { return p.commits; });

    var xScale = d3.scale.linear()
        .domain([d3.min(commitCounts), d3.max(commitCounts)])
        .range([100, 600]);

    var yScale = d3.scale.ordinal()
        .domain(nameDomain)
        .rangeBands([0, 400], 0.2);

    var colorScale = d3.scale.category10()
        .domain(osDomain);

    var svg = d3.select(containerElement)
        .select('svg');

    if (svg.empty())
        svg = d3.select(containerElement).append('svg')
            .style('width', 600)
            .style('height', 400);

    var bars = svg
        .selectAll('rect.person')
        .data(data, function(p) { return p.name; });

    bars.enter().append('rect')
        .attr('class', 'person')
        .attr('x', 100)
        .attr('y', function(p) { return yScale(p.name); })
        .attr('height', yScale.rangeBand())
        .attr('width', 0)
        .style('opacity', 0);

    bars.exit()
        .transition().duration(500)
            .style('opacity', 0)
            .attr('height', 0)
            .attr('width', 0)
            .remove();

    bars
        .transition().duration(500)
            .attr('y', function(p) { return yScale(p.name) ; })
            .attr('height', yScale.rangeBand())
            .attr('width', function(p) { return xScale(p.commits); })
            .style('fill', function(p) { return colorScale(p.os); })
            .style('opacity', 1);

    var texts = svg
        .selectAll('text.name')
        .data(data, function(p) { return p.name;});

    texts.enter().append('text')
        .attr('class', 'name')
        .attr('x', 0)
        .attr('y', function(p) { return yScale(p.name) + yScale.rangeBand() / 2; })
        .style('opacity', 0);

    texts.exit()
        .transition().duration(500)
            .style('opacity', 0)
            .remove();

    texts.text(function(p) { return p.name; })
        .transition().duration(500)
            .style('opacity', 1)
            .attr('y', function(p) { return yScale(p.name) + yScale.rangeBand() / 2; });

});