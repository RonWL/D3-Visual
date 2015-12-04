$.d3Visual = {
    id: 'd3Visual',
    version: '1.0',
    defaults: {
		_$type:"histogram",
		_$array: null,						// Target Array Holding Info for Histogram
		_$labelIndex: null,					//	Values / Index in Target Array Holding Labels of Bars
		_$variableIndex: null,				//	Values / Index in Target Array Holding Actual Data
		_$maxRange: null,					//	Max Range of the Scale(s)
		_$numOfTicks: 10,					//	How Many Ticks to be Presented on Axees
		_$width: 100, 						//	Width of Histogram
		_$height: 100, 						//	Height of Histogram
		_$margin: [10, 10, 10, 10],			//	Margin (Top, Right, Bottom, Left)
		_$spacing: 0.05,						//	Spacing Between Bars (Decimal %)
		_$triggerElement: null,				//	If Attaching Animation / Formation to Element Event
		_$hasGrid: false,					//	If the current graph will have a grid (Only applies to Histogram)
		_$numberFormat: "",
		_$layout: "vertical",				//	Type of Histogram - Vertical or Horizontal
		_$textLayout: [["10px", "0em", ".55em", "middle", ""], ["10px", 6, "0em", ".71em", "end", ""]],
					  
		// The following options are for Pie Layout
		_$outer_radius: 0.9,
		_$inner_radius: 0.85,
		_$legend: null
							
	}
};

(function ($) 
{
    $.fn.extend({
        d3Visual: function (params) 
		{
            return this.each(function () 
			{
                var opts = $.extend({}, this.defaults, params);
			
				var _type = opts._$type, 
				_array = opts._$array,
				_label = opts._$labelIndex,
				_var = opts._$variableIndex,
				_margin = opts._$margin,
				_width = opts._$width,
				_height = opts._$height,
				_target = $(this),
				_trigger = opts._$triggerElement,
				_maxRange = opts._$maxRange,
				_hasGrid = opts._$hasGrid,
				_numTicks = opts._$numOfTicks,
				_spacing = opts._$spacing,
				_format = opts._$numberFormat,
				_layout = opts._$layout,
				_textLayout = opts._$textLayout,
				
				_outer_radius = opts._$outer_radius,
				_inner_radius = opts._$inner_radius,
				_legend_array = opts._$legend;
				
				var formatCount;
				switch(_format)
				{
					case "percent" :
						formatCount = d3.format("%");
						break;
						
					case "decimal" :
						formatCount = d3.format(",.0f");						
						break;
						
					case "" :
						formatCount = d3.format("");
						break;
				}
							
				$.each(_array, function($i, $a)
				{
					$a.name = $a[_label]; 
					$a.variable = parseFloat(parseFloat($a[_var]).toFixed(2));
				});
					
				var $margin = {top: _margin[0], right: _margin[1], bottom: _margin[2], left: _margin[3]},
				$width = _width - $margin.left - $margin.right,
				$height = _height - $margin.top - $margin.bottom;
				
				switch (_type)
				{
					case "histogram" :
						var $x_scale;
						var $y_scale;
						
						var $x_axis;
						var $y_axis;
						
						if (_layout === "vertical")
						{
							console.log(_spacing);
							$x_scale = d3.scale.ordinal().rangeRoundBands([0, $width], _spacing);
						
							if (typeof _maxRange === "undefined" || _maxRange === null)
							{
								$y_scale = d3.scale.linear()
											.domain([0, d3.max(_array, function($a) { return $a.variable; })])
											.range([$height, 0]);
							} else {
								$y_scale = d3.scale.linear()
											.domain([0, _maxRange])
											.range([$height, 0]);
							}			
							$x_axis = d3.svg.axis()
								.scale($x_scale)
								.orient("bottom")
								.tickSize(1);	
					
							$y_axis = d3.svg.axis()
								.scale($y_scale)
								.orient("left")
								.ticks(_numTicks)
								.tickFormat(formatCount)
								.tickSize(1);
								
						} else {									
							if (typeof _maxRange === "undefined" || _maxRange === null)
							{
								$x_scale = d3.scale.linear()
											.domain([0, d3.max(_array, function($a) { return $a.variable; })])
											.range([0, $width]);
							} else {
								$x_scale = d3.scale.linear()
											.domain([0, _maxRange])
											.range([0, $width]);
							}
							$y_scale = d3.scale.linear()
								.domain([0, _array.length])
								.range([0, $height - ($margin.bottom / 1.5)]);
							
							$x_axis = d3.svg.axis()
								.scale($x_scale)
								.orient("bottom")
								.ticks(_numTicks)
								.tickFormat(formatCount)
								.tickSize(1);
		
							$y_axis = d3.svg.axis()
								.scale($y_scale)
								.orient("left")
								.tickValues(d3.range(_array.length))
								.tickFormat(function(d,i){ return _array[i].name; })
								.tickSize(1);
						}
						
						var $hg_svg;
							
						if (_target === "body")
						{
							$hg_svg = d3.select($(_target)).append("svg")
							.attr("width", $width + $margin.left + $margin.right)
							.attr("height", $height + $margin.top + $margin.bottom)
							.append("g")
								.attr("transform", "translate(" + $margin.left + "," + $margin.right + ")");	
						} else {
							$(_target).empty();
							$hg_svg = d3.select($(_target)[0]).append("svg")
							.attr("width", $width + $margin.left + $margin.right)
							.attr("height", $height + $margin.top + $margin.bottom)
							.append("g")
								.attr("transform", "translate(" + $margin.left + "," + $margin.right + ")");
						}
						
						if (_layout === "vertical")
						{
							$x_scale.domain(_array.map(function($a) { return $a.name; }));
						
							$hg_svg.append("g")
								.attr("id","xaxis")
								.attr("class", "x axis")
								.attr("transform", "translate(0," + $height + ")")
								.call($x_axis)
								.selectAll("text")
								.style({"text-anchor":_textLayout[0][3], "font-size":_textLayout[0][0]})
									.attr("dx", _textLayout[0][1])
									.attr("dy", _textLayout[0][2])
									.attr("transform", _textLayout[0][4]);
								
							$hg_svg.append("g")
								.attr("id","yaxis")
								.attr("class", "y axis")
								.call($y_axis)
								.selectAll("text")
								.style({"text-anchor":_textLayout[1][4], "font-size":_textLayout[1][0]})
									.attr("y", parseInt(_textLayout[1][1]))
									.attr("dx", _textLayout[1][2])
									.attr("dy", _textLayout[1][3])
									.attr("transform", _textLayout[1][5]);
						} else {
							 $hg_svg.append("g")
								.attr("id","xaxis")
								.attr("class", "x axis")
								.attr("transform", "translate(0, " + $width + ")")
								.call($x_axis)
								.selectAll("text")
									.style({"text-anchor":_textLayout[0][3], "font-size":_textLayout[0][0]})
									.attr("dx", _textLayout[0][1])
									.attr("dy", _textLayout[0][2])
									.attr("transform", _textLayout[0][4]);
							
							$hg_svg.append("g")
								.attr("id","yaxis")
								.attr("class", "y axis")
								.call($y_axis)
								.selectAll("text")
								.style({"text-anchor":_textLayout[1][4], "font-size":_textLayout[1][0]})
									.attr("y", parseInt(_textLayout[1][1]))
									.attr("dx", _textLayout[1][2])
									.attr("dy", _textLayout[1][3])
									.attr("transform", _textLayout[1][5]);
						}
						
						if (_hasGrid)
						{		
							if (_hasGrid)
							{
								var $x_grid = $x_axis.ticks(_numTicks)
									.tickSize(-$height, 0)
									.tickFormat("")
									.orient("top");
								
								var $y_grid = $y_axis.ticks(_numTicks)
									.tickSize($width, 0)
									.tickFormat("")
									.orient("right");
								
								$hg_svg.append("g")
									.classed('x', true)
									.classed('grid', true)
									.call($x_grid);
									
								$hg_svg.append("g")
									.classed('y', true)
									.classed('grid', true)
									.call($y_grid);
							}
						}
							
						if (typeof _trigger !== "undefined" && _trigger !== null)
						{
							$(_trigger).on("click", function()
							{
								init_bars();
							});
						} else {
							init_bars();
						}
						
						function init_bars()
						{					
							if (_layout === "vertical")
							{						
								var bar = $hg_svg.selectAll("bar")
									.data(_array)
									.enter().append("rect")
									.style("fill", "steelblue")
									.attr("x", function($a) { return $x_scale($a.name); })
									.attr("width", $x_scale.rangeBand())
									.attr("y", $height)
									.attr("height", 0)
										.transition()
											.delay(function(b, i) { return i * 80; })
											.attr("height", function($a) { return $height - $y_scale($a.variable); })
											.attr("y", function($a) { return $y_scale($a.variable); })
											.duration(1000);
							} else {
								var bar = $hg_svg.selectAll("bar")
									.data(_array)
									.enter().append("rect")
									.attr({"x":0,"y":function(d,i){ return $y_scale(i)+25; }})
									.style("fill", "steelblue")
									.attr("height", 25)
									.attr("width", 0)
										.transition()
											.delay(function(b, i) { return i * 80; })
											.attr("width", function($a) { return $x_scale($a.variable); })
											.duration(1000);	
							}
						}
						break;
						
					case "pie" :
						var $p_svg;
						var $pie;
						var $chart;
						var $arc;
						
						$width = $width + $margin.left + $margin.right;
						$height = $height + $margin.top + $margin.bottom;
						
						var $min = Math.min($width, $height);
						var $outer_r = $min / 2 * _outer_radius;
						var $inner_r = $min / 2 * _inner_radius;
							
						var $pie_array = [];
						var $pie_labels = [];
					
						$.each (_array, function(idx, itm)
						{
							$pie_labels.push(itm[0]);
							$pie_array.push(itm[1]);
						});
						
						var $data = $pie_array;
						var $labels = $pie_labels;
						
						var $color = d3.scale.category20();
						
						if ($p_svg !== undefined && $p_svg !== null)
						{	
							if (typeof _trigger !== "undefined" && _trigger !== null)
							{
								$(_trigger).on("click", function()
								{
									render($data, $labels);
								});
							} else {
								render($data, $labels);
							}
						} else {
							$arc = d3.svg.arc()
								.outerRadius($outer_r)
								.innerRadius($inner_r);
							
							if (_target === "body")
							{
								$p_svg = d3.select($(_target));
							} else {
								$(_target).empty();
								$p_svg = d3.select($(_target)[0]);
							}
							$pie = d3.layout.pie()
								.value(function(d) {
									return d;
								})
								.sort(null);
						
							$chart = $p_svg.append("svg")
								.attr("width", $width)
								.attr("height", $height)
								.attr("class", "pie")
								.append("g")
								.attr("transform", "translate(" + $width / 2 + "," + $height / 2 + ")");
							
							if (typeof _trigger !== "undefined" && _trigger !== null)
							{
								$(_trigger).on("click", function()
								{
									render($data, $labels);
								});
							} else {
								render($data, $labels);
							}
						}
						break;
				}
				
				function render($data_array, $label_array)
				{ 									
					var $arcs = $chart.selectAll("g.slice")
						.data($pie($data_array)) // Bind the pie layout to the slices
						.attr("id", "arcs")
						.enter()
						.append("g");
					
					$arcs.append("path")
					.attr("fill", function(d, i) {
						if (_legend_array !== null)
						{
							_legend_array[i].css({"background-color": $color(i)});
						}
						return $color(i);
					})
					.attr("d", $arc)
					.attr("class", "slice")
					.each(function(d) {
					  this._current = d;
					})
					.transition()
					.duration(1000)
					.attrTween("d", arcTween);	
				}
				// add transition to new path
				function arcTween(b) {
					var start = {
						startAngle: b.startAngle,
						endAngle: b.startAngle
					};
					var i = d3.interpolate(start, b);
						return function(t) {
							return $arc(i(t));
						};
				}
			});
        }
    });
})(jQuery);