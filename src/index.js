import React, { Component, PropTypes } from 'react';

export default class SVGIcon extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
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
    color: 'black',
    preserveAspectRatio: 'xMidYMid meet',
  };

  state = {
    svgString: undefined,
  };

  defaultViewBox = '0 0 originalWidth originalHeight';

  svgProps = [
    'path',
    'width',
    'height',
    'color',
    'preserveAspectRatio',
    'viewBox'
  ];

  componentWillMount() {
    this.getSvgString(this.props.path);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.path !== newProps.path) {
      this.getSvgString(newProps.path)
    }
  }

  getSvgString(path) {
    if (path) {
      const ajax = new XMLHttpRequest();

      ajax.open("GET", path, true);
      ajax.send();
      ajax.onload = () => this.setState({
        svgString: ajax.responseText
      });
    }
  }

  processSvg(svgString) {
    const node = new DOMParser().parseFromString(svgString, 'image/svg+xml');

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
    svg.style.width = '100%';
    svg.style.height = '100%';
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
    if (this.state.svgString) {
      // Remove svg attributes
      var props = Object.assign({}, this.props);
      this.svgProps.forEach(propKey => delete props[propKey]);
      delete props.style;

      return (
        <span
          dangerouslySetInnerHTML={{
            __html: this.processSvg(this.state.svgString, this.props.color)
          }}
          className="icon"
          style={{
            color: 'currentColor',
            ...this.props.style,
          }}
          {...props}
        />
      );
    }
    else {
      return <span />
    }
  }
}
