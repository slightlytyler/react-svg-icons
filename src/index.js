import React, { Component, PropTypes } from 'react';

export default class SVGCon extends Component {
  static propTypes = {
    svg: PropTypes.string.isRequired,
    width: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    height: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    color: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    preserveAspectRatio: PropTypes.string,
    viewBox: PropTypes.string,
  };

  static defaultProps = {
    color: 'currentColor',
    preserveAspectRatio: 'xMidYMid meet',
  };

  defaultViewBox = '0 0 originalWidth originalHeight';

  svgProps = [
    'svg',
    'width',
    'height',
    'color',
    'preserveAspectRatio',
    'viewBox'
  ];

  processSvg(svg) {
    const node = new DOMParser().parseFromString(svg, 'image/svg+xml');

    this.normalize(node);
    this.colorize(node);

    return new XMLSerializer().serializeToString(node);
  }

  normalize(node) {
    const svg = node.querySelector('svg');

    // Set preserverAspectRatio
    svg.setAttribute('preserveAspectRatio', this.props.preserveAspectRatio)

    // Set viewBox
    if (this.props.viewBox) {
      svg.setAttribute('viewBox', this.props.viewBox);
    }
    else if (!svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', this.defaultViewBox);
    }

    // Set width and height
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.width = 'inherit';
    svg.style.height = 'inherit';
    svg.style.display = 'block';
  }

  colorize(node) {
    const { color } = this.props;
    const chooseColor = typeof color === 'function' ? color : false;

    // For each element replace fill and stroke with color
    Array.from(node.querySelectorAll('*')).forEach(el => {
      const currentFill = el.getAttribute('fill');

      if (currentFill && currentFill !== 'none') {
        el.setAttribute(
          'fill',
          chooseColor
            ? chooseColor('fill', currentFill)
            : color
        );
      }

      const currentStroke = el.getAttribute('stroke');

      if (currentStroke && currentStroke !== 'none') {
        el.setAttribute(
          'stroke',
          chooseColor
            ? chooseColor('stroke', currentStroke)
            : color
        );
      }
    });
  }

  render() {
    if (this.props.svg) {
      // Remove svg attributes
      const props = Object.assign({}, this.props);
      this.svgProps.forEach(svgProp => delete props[svgProp]);
      delete props.style;

      return (
        <span
          dangerouslySetInnerHTML={{
            __html: this.processSvg(this.props.svg, this.props.color)
          }}
          className="icon"
          style={{
            width: this.props.width,
            height: this.props.height,
            ...this.props.style
          }}
          { ...props }
        />
      );
    }
    else {
      return <span />
    }
  }
}
