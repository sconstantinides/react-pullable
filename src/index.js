import React from 'react';
import styled, { keyframes } from 'styled-components';

class Pullable extends React.Component {
  constructor(props) {
    super(props);

    this.className = props.className || 'pullable';
    this.spinnerSize = props.spinnerSize || 24;
    this.spinnerColor = props.spinnerColor || '#FFFFFF';
    this.spinSpeed = props.spinSpeed || 1200;
    this.popDuration = props.popDuration || 200;
    this.distThreshold = props.distThreshold || this.spinnerSize * 3;
    this.resistance = props.resistance || 2.5;
    this.refreshDuration = props.refreshDuration || 1000;
    this.transitionDuration = props.transitionDuration || 400;
    this.transitionEase = props.transitionEase || 'cubic-bezier(0.215, 0.61, 0.355, 1)';
    this.shouldPullToRefresh = props.shouldPullToRefresh ? props.shouldPullToRefresh : () => window.scrollY <= 0;

    this.clearTouchStatus();

    this.state = {
      status: 'ready',
      height: 0
    };
  }

  componentDidMount() {
    window.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
  }

  componentWillUnmount() {
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove, { passive: false });
    window.removeEventListener('touchend', this.onTouchEnd);

    clearTimeout(this.refreshCompletedTimeout);
    clearTimeout(this.resetTimeout);
  }

  clearTouchStatus = () => {
    this.pullStartY = null;
    this.pullMoveY = null;
    this.dist = 0;
    this.distResisted = 0;
    this.ignoreTouches = false;
  };

  onTouchStart = (e) => {
    if (this.props.disabled || this.ignoreTouches) return;

    if (this.state.status === 'ready' && this.shouldPullToRefresh()) {
      this.pullStartY = e.touches[0].screenY;
    } else {
      this.pullStartY = null;
    }
  };

  onTouchMove = (e) => {
    if (this.props.disabled || this.ignoreTouches || this.pullStartY === null) return;

    this.pullMoveY = e.touches[0].screenY;
    this.dist = this.pullMoveY - this.pullStartY;

    if (this.dist > 0) {
      e.preventDefault();

      this.distResisted = Math.min(this.dist / this.resistance, this.distThreshold);

      this.setState({ status: 'pulling', height: this.distResisted }, () => {
        if (this.distResisted === this.distThreshold) this.refresh();
      });
    }
  };

  onTouchEnd = (e) => {
    if (this.props.disabled || this.ignoreTouches) return;

    if (this.state.status === 'pulling') {
      this.ignoreTouches = true;
      this.setState({ status: 'pullAborted', height: 0 }, () => {
        this.reset(this.transitionDuration);
      });
    } else {
      this.reset();
    }
  };

  refresh = () => {
    this.ignoreTouches = true;
    this.setState({ status: 'refreshing' }, () => {
      this.props.onRefresh();

      this.refreshCompletedTimeout = setTimeout(() => {
        this.setState({ status: 'refreshCompleted', height: 0 }, () => {
          this.reset(this.transitionDuration);
        });
      }, this.refreshDuration);
    });
  };

  reset = (delay = 0) => {
    this.resetTimeout = setTimeout(() => {
      this.clearTouchStatus();
      this.setState({ status: 'ready' });
    }, delay);
  };

  render() {
    const status = this.state.status;
    const percentPulled = this.distResisted / this.distThreshold;

    return (
      <React.Fragment>
        <Container
          className={this.className}
          height={this.state.height}
          transition={status === 'pullAborted' || status === 'refreshCompleted'}
          transitionDuration={this.transitionDuration}
          transitionEase={this.transitionEase}
        >
          <Spinner
            percentPulled={percentPulled}
            spinnerSize={this.spinnerSize}
          >
            <SpinnerSVG
              spinnerSize={this.spinnerSize}
              spinnerColor={this.spinnerColor}
              popDuration={this.popDuration}
              spinSpeed={this.spinSpeed}
              spinning={status === 'refreshing' || status === 'refreshCompleted'}
            >
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </SpinnerSVG>
          </Spinner>
        </Container>

        {this.props.children}
      </React.Fragment>
    );
  }
}

const Container = styled.div.attrs({
  style: props => ({
    height: props.height,
    transition: props.transition ? `height ${props.transitionDuration}ms ${props.transitionEase}` : 'none'
  })
})`
  display: flex;
  overflow: hidden;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
`;

const Spinner = styled.div.attrs({
  style: props => ({
    opacity: props.percentPulled,
    transform: `translateY(${(props.percentPulled * props.spinnerSize) - props.spinnerSize}px) rotate(${props.percentPulled * 90}deg)`
  })
})`
  transform-origin: center;
`;

const SpinnerSVG = styled.svg.attrs({
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  style: props => ({
    width: props.spinnerSize,
    height: props.spinnerSize,
    stroke: props.spinnerColor,
    animation: props.spinning ? `${scale} ${props.popDuration}ms cubic-bezier(0.55, 0.055, 0.675, 0.19), ${rotate360} ${props.spinSpeed}ms linear ${props.popDuration}ms infinite` : 'none'
  })
})``;

const scale = keyframes`
  0% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const rotate360 = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export default Pullable;
