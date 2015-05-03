var demoBox = byId('demo-box');
var demoBoxContents = byId('demo-box-contents');
var demoBoxRun = byId('demo-box-run');
var demoBoxClear = byId('demo-box-clear');
var demoBoxClose = byId('demo-box-close');
var demoBoxShuffle = byId('demo-box-shuffle');
var demoBoxTransitionSpeed = byId('demo-box-transitionSpeed');

window.currentRunFunction = null;

function shuffle(a,b,c,d){//array,placeholder,placeholder,placeholder
    c=a.length;while(c)b=Math.random()*(--c+1)|0,d=a[c],a[c]=a[b],a[b]=d
}
function byId(id) { return document.getElementById(id); }
function rnd(max, min) { return (isNaN(min) ? 0 : min) + Math.floor(Math.random() * (isNaN(max) ? 100 : max) + 0.5); }

function dt() { return parseInt(demoBoxTransitionSpeed.value); }

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

    if (demoBoxShuffle.checked)
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
    clearStuff();
    demoBox.classList.add('demo-box-hide');
    currentRunFunction = null;
}

demoBoxClose.addEventListener('click', hideBox);
demoBoxRun.addEventListener('click', function() {
    if (currentRunFunction)
        currentRunFunction();
});

var onClear = [];
demoBoxClear.addEventListener('click', clearStuff);

function clearStuff() {
    onClear.forEach(function(c) {
        c();
    });
    onClear = [];
    demoBoxContents.innerHTML = '';
}

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
        .transition().duration(dt())
        .style('opacity', 0)
        .remove();

    selection
        .text(function(p) { return p.name + " has " + p.commits + " commits"; })
        .transition().duration(dt())
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
    scale('Qux'); // 1750
}, 1);

setupDemo('scale-ordinal-rangeband', function(containerElement) {
    var scale = d3.scale.ordinal()
        .domain(['Foo', 'Bar', 'Baz', 'Qux'])
        .rangeBands([0, 2100], 0.2);

    scale('Foo'); // 100
    scale('Bar'); // 600
    scale('Baz'); // 1100
    scale.rangeBand(); // 400
}, 1);

setupDemo('demo-bar', function(containerElement) {
    var data = generateSample();

    var nameDomain = data.map(function(p) { return p.name; });
    var osDomain = data.map(function(p) { return p.os; });
    var commitCounts = data.map(function(p) { return p.commits; });

    var xScale = d3.scale.linear()
        .domain([0, d3.max(commitCounts)])
        .range([0, 450]);

    var yScale = d3.scale.ordinal()
        .domain(nameDomain)
        .rangeBands([0, 350], 0.2);

    var colorScale = d3.scale.category10()
        .domain(osDomain);

    var svg = d3.select(containerElement)
        .selectAll('svg')
        .data(['svg']);

    svg.enter().append('svg')
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
        .transition().duration(dt())
            .style('opacity', 0)
            .attr('width', 0)
            .remove();

    bars
        .transition().duration(dt())
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
        .transition().duration(dt())
            .style('opacity', 0)
            .remove();

    texts.text(function(p) { return p.name; })
        .transition().duration(dt())
            .style('opacity', 1)
            .attr('y', function(p) { return yScale(p.name) + yScale.rangeBand() / 2; });

    var axis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');

    var axisGroup = svg
        .selectAll('g.x-axis')
        .data(['xAxis']);

    axisGroup.enter().append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(100, 350)');

    axisGroup
        .transition().duration(dt())
        .call(axis);
});

setupDemo('live-loading', function(containerElement) {
    function currentData() {
        var delta = rnd(10)-5;
        return {
            id: rnd(10000000),
            time: new Date(),
            status: delta > 0 ? 'good' : 'bad',
            value: Math.max(10, Math.min(90, collectedData[collectedData.length-1].value + delta))
        };
    };

    var collectedData = [{time: new Date(), status: 'bad', value: 50}];

    var xScale = d3.time.scale()
        .range([50, 550]);

    var yScale = d3.scale.linear()
        .domain([100, 0])
        .range([50, 350]);

    var colorScale = d3.scale.ordinal()
        .domain(['good', 'bad'])
        .range(['green', 'red']);

    var svg = d3.select(containerElement)
        .selectAll('svg')
        .data(['svg']);

    svg.enter().append('svg')
        .style('width', 600)
        .style('height', 400);

    var axis = d3.svg.axis()
        .tickFormat(d3.time.format('%H:%M:%S'))
        .ticks(d3.time.seconds, 1)
        .scale(xScale);

    var intervalId = setInterval(function() {
        var nextDataPoint = currentData();
        collectedData.push(nextDataPoint);
        var maxTime = d3.max(collectedData.map(function(d) { return d.time;}))
        var minTime = new Date(+maxTime - 5000);

        while (collectedData[0].time < minTime)
            collectedData.shift();

        xScale.domain([minTime, maxTime]);

        var circles = svg.selectAll('circle')
            .data(collectedData, function(d) { return d.id; });

        circles.enter()
            .append('circle')
            .attr('r', 3)
        circles.exit().remove();

        circles
            .transition().duration(dt()).ease('linear')
            .attr('cx', function(d) { return xScale(d.time)})
            .attr('cy', function(d) { return yScale(d.value)})
            .style('fill', function(d) { return colorScale(d.status); });

        var axisGroup = svg.selectAll('g')
            .data(['xAxis'])

        axisGroup.enter().append('g');
        axisGroup
            .transition().duration(dt()).ease('linear')
            .call(axis);
    }, dt());

    onClear.push(function() { clearInterval(intervalId);});

});

setupDemo('live-loading-path', function(containerElement) {
    function currentData() {
        var delta = rnd(10)-5;
        return {
            id: rnd(10000000),
            time: new Date(),
            value: Math.max(10, Math.min(90, collectedData[collectedData.length-1].value + delta))
        };
    };

    var collectedData = [{time: new Date(), status: 'bad', value: 50}];

    var xScale = d3.time.scale()
        .range([50, 550]);

    var yScale = d3.scale.linear()
        .domain([100, 0])
        .range([50, 350]);

    var svg = d3.select(containerElement)
        .selectAll('svg')
        .data(['svg']);

    svg.enter().append('svg')
        .style('width', 600)
        .style('height', 400);

    var path = svg
        .selectAll('path')
        .data([collectedData]);

    path.enter().append('path');

    var pathTransform = d3.svg.line()
        .x(function(d) { return xScale(d.time)})
        .y(function(d) { return yScale(d.value)});

    var axis = d3.svg.axis()
        .tickFormat(d3.time.format('%H:%M:%S'))
        .ticks(d3.time.seconds, 1)
        .orient('top')
        .scale(xScale);

    var intervalId = setInterval(function() {
        var nextDataPoint = currentData();
        collectedData.push(nextDataPoint);
        var maxTime = d3.max(collectedData.map(function(d) { return d.time;}))
        var minTime = new Date(+maxTime - 5000);

        while (collectedData[0].time < minTime)
            collectedData.shift();

        xScale.domain([minTime, maxTime]);

        path
            .transition().duration(dt()).ease('linear')
            .attr('d', pathTransform);

        var axisGroup = svg.selectAll('g')
            .data(['xAxis'])

        axisGroup.enter().append('g');
        axisGroup
            .transition().duration(dt()).ease('linear')
            .call(axis);
    }, dt());

    onClear.push(function() { clearInterval(intervalId);});

});

setupDemo('leaflet', function(containerElement) {
    containerElement.style.height = '600px';
    var map = L.map(containerElement).setView([-30.3, 140], 4);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

    d3.csv("data/cyclones.csv", function(data) {
        var cycloneMap = {};
        for (var i=0; i < data.length; i++) {
            var point = data[i];
            cycloneMap[point.Id] = cycloneMap[point.Id] || { id: point.Id, name: point.Name, points: [] };
            cycloneMap[point.Id].points.push({
                lat: parseFloat(point.LAT),
                lon: parseFloat(point.LON),
                severity: parseInt(point.SURFACE_CODE),
                time: new Date(point.Time)
            });
        }

        var transform = d3.svg.line()
            .tension(0)
            .x(function(d) { return projectPoint(d.lon, d.lat).x; })
            .y(function(d) { return projectPoint(d.lon, d.lat).y; });

        function projectPoint(lon, lat) {
            return map.latLngToLayerPoint(new L.LatLng(lat, lon));
        }

        var cyclones = Object.keys(cycloneMap)
            .map(function(id) { return cycloneMap[id]; });

        var cyclonePaths = g.selectAll('path')
            .data(cyclones.slice(0, dt()/10), function(c) { return c.id; })

        cyclonePaths.enter().append('path');
        cyclonePaths.exit().remove();

        cyclonePaths
            .style('stroke', 'red')
            .style('stroke-width', 2);

        map.on('viewreset', reset);
        reset();

        function reset() {
            cyclonePaths.attr('d', function(c) { return transform(c.points); } );

            g.attr("transform", null);

            var bounds = g.node().getBBox();

            svg.attr("width", bounds.width)
                .attr("height", bounds.height)
                .style("left", bounds.x)
                .style("top", bounds.y);

            g.attr("transform", "translate(" + -bounds.x + "," + -bounds.y + ")");
        }
    });

    onClear.push(function() { map.remove(); containerElement.style.height = ''; });
});