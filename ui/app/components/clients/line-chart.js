import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { max } from 'd3-array';
// eslint-disable-next-line no-unused-vars
import { select, selectAll, node } from 'd3-selection';
import { axisLeft, axisBottom } from 'd3-axis';
import { scaleLinear, scalePoint } from 'd3-scale';
import { format } from 'd3-format';
import { line } from 'd3-shape';
import { LIGHT_AND_DARK_BLUE, SVG_DIMENSIONS } from '../../utils/chart-helpers';

/**
 * @module LineChart
 * LineChart components are used to...
 *
 * @example
 * ```js
 * <LineChart @requiredParam={requiredParam} @optionalParam={optionalParam} @param1={{param1}}/>
 * ```
 * @param {object} requiredParam - requiredParam is...
 * @param {string} [optionalParam] - optionalParam is...
 * @param {string} [param1=defaultValue] - param1 is...
 */

export default class LineChart extends Component {
  @tracked tooltipTarget = '';
  @tracked hoveredLabel = '';

  @action
  renderChart(element, args) {
    let dataset = args[0];
    let chartSvg = select(element);
    let yMaxValue = max(dataset.map(d => d.clients)); // TODO will need to recalculate when we get the data
    let xMaxValue = dataset.map(d => d.month);
    chartSvg.attr('viewBox', `-50 20 600 ${SVG_DIMENSIONS.height}`); // set svg dimensions

    let yScale = scaleLinear()
      .domain([0, yMaxValue])
      .range([0, 100]);

    let yAxisScale = scaleLinear()
      .domain([0, yMaxValue]) // TODO will need to recalculate when you get the data
      .range([SVG_DIMENSIONS.height, 0]);

    let xScale = scalePoint() //use scaleTime()?
      .domain(xMaxValue)
      .range([0, SVG_DIMENSIONS.width])
      .padding(0.2);

    let formatNumbers = number => format('.1s')(number).replace('G', 'B'); // replace SI sign of 'G' for billions to 'B'

    let yAxis = axisLeft(yAxisScale)
      .ticks(7)
      .tickPadding(10)
      .tickSizeInner(-SVG_DIMENSIONS.width) // makes grid lines length of svg
      .tickFormat(formatNumbers);

    let xAxis = axisBottom(xScale).tickSize(0);

    yAxis(chartSvg.append('g'));
    xAxis(chartSvg.append('g').attr('transform', `translate(0, ${SVG_DIMENSIONS.height + 10})`));
    chartSvg.selectAll('.domain').remove(); // remove domain lines

    let lineGenerator = line()
      .x(d => xScale(d.month))
      .y(d => yAxisScale(d.clients));

    // LINE (PATH) BETWEEN DOTS
    chartSvg
      .append('g')
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', LIGHT_AND_DARK_BLUE[1])
      .attr('stroke-width', 0.5)
      .attr('d', lineGenerator(dataset));

    // CIRCLES
    chartSvg
      .append('g')
      .selectAll('circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('class', 'data-plot')
      .attr('cy', d => `${100 - yScale(d.clients)}%`)
      .attr('cx', d => xScale(d.month))
      .attr('r', 3.5)
      .attr('fill', LIGHT_AND_DARK_BLUE[0])
      .attr('stroke', LIGHT_AND_DARK_BLUE[1])
      .attr('stroke-width', 1.5);
  }

  @action removeTooltip() {
    this.tooltipTarget = null;
  }
}