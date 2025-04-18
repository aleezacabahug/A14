import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    this.createChart();
  }

  private createChart(): void {
    const data = [
      { category: 'African American', value: 31 },
      { category: 'Asian American', value: 19 },
      { category: 'Latin', value: 25 }
    ];

    const svg = d3.select('svg');
    const margin = 50;
    const width = +svg.attr('width') - margin * 2;
    const height = +svg.attr('height') - margin * 2;
    const chart = svg.append('g')
      .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.category))
      .padding(0.4);

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.value) ?? 0]);

    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    chart.append('g')
      .call(d3.axisLeft(yScale));

    chart.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.category) ?? 0)
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.value))
      .attr('fill', '#ff5722');
  }
}

