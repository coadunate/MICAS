import React from 'react';
import { Group } from '@vx/group';
import { Arc } from '@vx/shape';
import { Partition } from '@vx/hierarchy';
import { arc as d3arc } from 'd3-shape';
import { scaleLinear, scaleSqrt, scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { interpolate } from 'd3-interpolate';
import Animate from 'react-move/Animate';
import NodeGroup from 'react-move/NodeGroup';

const color = scaleOrdinal(schemeCategory10);

function colores_google(n) {
  var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colores_g[n % colores_g.length];
}

export const COLORS = [
  '#6C6B74',
  '#2E303E',
  '#9199BE',
  '#54678F',
  '#212624',
  '#3A4751',
  '#1E272E',
  '#0A151D',
  '#030C12',
  '#253517',
  '#5D704E',
  '#324027',
  '#19280C',
  '#0D1903',
];

export default class extends React.Component {
  state = {
    xDomain: [0, 1],
    xRange: [0, 2 * Math.PI],
    yDomain: [0, 1],
    yRange: [0, this.props.width / 2 - 100],
    current_data: "-"
  }

  xScale = scaleLinear();
  yScale = scaleSqrt();

  arc = d3arc()
    .startAngle(d => Math.max(0, Math.min(2 * Math.PI, this.xScale(d.x0))))
    .endAngle(d => Math.max(0, Math.min(2 * Math.PI, this.xScale(d.x1))))
    .innerRadius(d => Math.max(0, this.yScale(d.y0)))
    .outerRadius(d => Math.max(0, this.yScale(d.y1)))

  handleClick = d => {
    this.setState({
      xDomain: [d.x0, d.x1],
      yDomain: [d.y0, 1],
      yRange: [d.y0 ? 20 : 0, this.props.width / 2 -100],
      current_data: this.getLineage(d)
    })
  }

  handleMouseOver = d => {
    this.setState({
      current_data: this.getLineage(d)
    })
  }

  getLineage = d => {
    var final = ""
    var curr_d = d
    while(curr_d.parent != null){
      if(final === ""){
        final = curr_d.parent.data.name
      } else {
        final = " > " + curr_d.parent.data.name + " > " + final;
      }
      curr_d = curr_d.parent
    }
    if(final == ""){
      final = d.data.name + " [" + d.value +  " reads]";
    } else {
      final = final + " > " + d.data.name + " [" + d.value +  " reads]";
    }
    return final
  }

  render() {
    const {
      root,
      width,
      height,
      margin = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    } = this.props;
    const { xDomain, xRange, yDomain, yRange } = this.state;

    if (width < 10) return null;

    const radius = (Math.min(width, height) / 2) - 10;

    return (
      <svg width={window.innerWidth/2} height={height}>
        <Partition
          top={margin.top}
          left={margin.left}
          root={root}
        >
          {({ data }) => {
            const nodes = data.descendants();
            return (
              <Animate
                key={data.data.name}
                start={() => {
                  this.xScale.domain(xDomain).range(xRange);
                  this.yScale.domain(yDomain).range(yRange);
                }}
                update={() => {
                  const xd = interpolate(this.xScale.domain(), xDomain);
                  const yd = interpolate(this.yScale.domain(), yDomain);
                  const yr = interpolate(this.yScale.range(), yRange);

                  return {
                    unused: t => {
                      this.xScale.domain(xd(t));
                      this.yScale.domain(yd(t))
                        .range(yr(t));
                    },
                    timing: {
                      duration: 150
                    }
                  }
                }}
              >
                {() => (
                  <Group top={height / 2} left={(width / 2)-100}>
                    {nodes.map((node, i) => (
                      <g key={`node-${i}`}>
                        <path
                          d={this.arc(node)}
                          strokeWidth={1}
                          fill={color(i)}
                          fillRule="evenodd"
                          onClick={() => this.handleClick(node)}
                          onMouseOver={() => this.handleMouseOver(node)}
                          key={`node-${i}`}
                        />
                      </g>
                    ))}
                  </Group>

                )}
              </Animate>
            )
          }}
        </Partition>
        <g>
          <text fill="rgba(0,0,0,1)" x={0} y={50} textAnchor="left" fontSize="20px">{ this.state.current_data }</text>
        </g>
        
      </svg>
    );
  }
}
