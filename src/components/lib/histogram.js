import React, {Component, PropTypes} from 'react'

import d3 from 'd3'

import numberShow from 'lib/numberShower/numberShower'

function getYScale(data, height) {
  return d3.scale.linear().
    domain([0, d3.max(data, (d) => d.y)]).
    range([height, 0]);
}

function getXScale(data, width) {
  return d3.scale.linear().
    domain(d3.extent(data)).
    range([0, width]).
    nice();
}

// Computes the average of an array of numbers. If the array is empty, returns 1.
function avg(arr) {
  return arr.length > 0 ? arr.reduce((a,b)=>a+b)/arr.length : 1
}

// Computes (min(|a|,|b|)+100)/(max(|a|,|b|)+100). We add 100 to both numerator and denominator to ensure that small
// numbers don't disproprortionately affect results.
function shiftedRatio(a,b) {
  return (Math.min(Math.abs(a),Math.abs(b))+100)/(Math.max(Math.abs(a),Math.abs(b))+100)
}

// filterLowDensityPoints removes points that occur in only low density regions of the histogram, to ensure that only
// points robustly well sampled in the data affect the visualization of the histogram.
//
// The parameter 'cutOffRatio' controls how hight te point density must be for points to be kept; a cutOffRatio of 0
// would keep everything, a cutOffratio of 1.0 would keep nothing.
// Values that seem to have notable affects are typically > 0.95.
function filterLowDensityPoints(inputData, cutOffRatio) {
  // We can't filter that intelligently for small sample sets, so we don't bother.
  if (inputData.length < 2000) {
    return inputData
  }

  const bucketSize = inputData.length / 1000 // Grab data in 0.1% chunks.

  // Filter Left
  // As long as the ratio of the magnitude of their averages is less than the cutOffRatio, we keep discarding the left
  // endpoint and iterating along the array.
  let i
  for (i = 0; i < inputData.length; i++) {
    const left = inputData.slice(i*bucketSize, (i+1)*bucketSize)
    const right = inputData.slice((i+1)*bucketSize, (i+2)*bucketSize)
    if (shiftedRatio(avg(left), avg(right)) >= cutOffRatio) { break }
  }
  const leftIndex = i*bucketSize

  // Filter Right, analogous to how we filter the left, but in reverse.
  for (i = 0; i < inputData.length; i++) {
    const left = inputData.slice(-(i+2)*bucketSize, -(i+1)*bucketSize)
    const right = i > 0 ? inputData.slice(-(i+1)*bucketSize, -i*bucketSize) : inputData.slice(-bucketSize)
    if (shiftedRatio(avg(left), avg(right)) >= cutOffRatio) { break }
  }
  const rightIndex = -i*bucketSize

  return rightIndex == 0 ? inputData.slice(leftIndex) : inputData.slice(leftIndex, rightIndex)
}

// data prop must be sorted.
export default class Histogram extends Component {
  static propTypes = {
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
    cutOffRatio: PropTypes.number,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.number).isRequired
  };

  static defaultProps = {
    top: 20,
    bottom: 30,
    bins: 40,
    left: 0,
    right: 0,
    cutOffRatio: 0, // By default cut off nothing.
  };

  render() {
    let { top, right, bottom, left, data, width, height, cutOffRatio } = this.props;
    width = width + 1

    const filtered_data = filterLowDensityPoints(data, cutOffRatio)

    let xScale = getXScale(filtered_data, width);
    let bins = this.props.bins
    let histogramDataFn = d3.layout.histogram().bins(xScale.ticks(bins));
    let histogramData = histogramDataFn(filtered_data);
    let yScale = getYScale(histogramData, height);
    let barWidth = width/histogramData.length;
    return (
      <div className="react-d3-histogram">
        {top && bottom && width && height &&
          <svg width={width + left + right} height={height + top + bottom}>
            <g transform={"translate(" + left + "," + top + ")"}>
              {histogramData.map((d, i) => <Bar data={d} xScale={xScale} yScale={yScale} height={height} barWidth={barWidth} key={i} />)}
              <XAxis height={height} scale={xScale} />
            </g>
          </svg>
        }
      </div>
    );
  }
}

class Path extends Component {
  static propTypes = {
    scale: PropTypes.func.isRequired
  };

  render() {
    let [start, end] = this.props.scale.range();
    let d = `M0${start},6V0H${end}V6`;

    return (
      <path className="react-d3-histogram__domain" d={d} />
    );
  }
}

class Tick extends Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    scale: PropTypes.func.isRequired
  };

  render() {
    let { value, scale } = this.props;
    let textStyle = { textAnchor: "middle" };

    let valueText = numberShow(value)
    let text = _.isFinite(value) && valueText
    text = `${text.value}`
    text += valueText.symbol ? valueText.symbol : ''
    text += valueText.power ? `e${valueText.power}` : ''
    if (text === '0.0') { text = '0' }
    return (
      <g className="react-d3-histogram__tick" transform={"translate(" + scale(value) + ",0)"}>
        <line x2="0" y2="6"></line>
        <text dy=".71em" y="-15" x="0" zindexstyle={textStyle}>
          {text}
        </text>
      </g>
    );
  }
}

export class XAxis extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    scale: PropTypes.func.isRequired
  };

  render() {
    let { height, scale } = this.props;

    let ticks = scale.ticks.apply(scale).map(function(tick, i) {
      return (
        <Tick value={tick} scale={scale} key={i} />
      );
    });

    return (
      <g className="react-d3-histogram__x-axis" transform={"translate(0," + height + ")"}>
        <Path scale={scale} />
        <g>{ticks}</g>
      </g>
    );
  }
}

export class Bar extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.number).isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
    barWidth: PropTypes.number.isRequired
  };

  render() {
    let { data, xScale, yScale, height, barWidth } = this.props;

    let scaledX = xScale(data.x);
    let scaledY = yScale(data.y);

    return (
      <g className="react-d3-histogram__bar" transform={"translate(" + scaledX + "," + scaledY + ")"}>
        <rect width={barWidth} height={height - scaledY} />
      </g>
    );
  }
}
