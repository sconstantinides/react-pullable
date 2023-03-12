import React from 'react';
import PropTypes from 'prop-types';
import styled, { css, keyframes } from 'styled-components';

class Pullable extends React.Component {
  constructor(props) {
    super(props);

    this.clearTouchStatus();

    this.componentId = `pull-div-${Date.now() + Math.floor(Math.random() * 10000)}`;

    this.state = {
      status: 'ready',
      height: 0,
    };
  }

  componentDidMount() {
    let element = this.props.targetComponent ? document.getElementById(this.componentId) : window;
    element.addEventListener('touchstart', this.onTouchStart);
    element.addEventListener('touchmove', this.onTouchMove, { passive: false });
    element.addEventListener('touchend', this.onTouchEnd);
  }

  componentWillUnmount() {
    let element = this.props.targetComponent ? document.getElementById(this.componentId) : window;
    element.removeEventListener('touchstart', this.onTouchStart);
    element.removeEventListener('touchmove', this.onTouchMove, { passive: false });
    element.removeEventListener('touchend', this.onTouchEnd);

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

    if (this.state.status === 'ready' && this.props.shouldPullToRefresh()) {
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

      this.distResisted = Math.min(this.dist / this.props.resistance, this.props.distThreshold);

      this.setState({ status: 'pulling', height: this.distResisted }, () => {
        if (this.distResisted === this.props.distThreshold) this.refresh();
      });
    }
  };

  onTouchEnd = (e) => {
    if (this.props.disabled || this.ignoreTouches) return;

    if (this.state.status === 'pulling') {
      this.ignoreTouches = true;
      this.setState({ status: 'pullAborted', height: 0 }, () => {
        this.reset(this.props.resetDuration);
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
          this.reset(this.props.resetDuration);
        });
      }, this.props.refreshDuration);
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
		const shouldSpin = status === 'refreshing' || status === 'refreshCompleted';
    const shouldReset = status === 'pullAborted' || status === 'refreshCompleted';
		const pctPulled = this.state.height / this.props.distThreshold;
      
    return (
      <React.Fragment>
        <Container
          className={this.props.className}
          height={this.state.height}
					centerSpinner={this.props.centerSpinner}
          resetDuration={this.props.resetDuration}
          resetEase={this.props.resetEase}
          shouldReset={shouldReset}
        >
          <Spinner
            pctPulled={pctPulled}
						fadeSpinner={this.props.fadeSpinner}
						rotateSpinner={this.props.rotateSpinner}
            spinnerSize={this.props.spinnerSize}
            spinnerOffset={this.props.spinnerOffset}
          	resetDuration={this.props.resetDuration}
          	resetEase={this.props.resetEase}
						shouldReset={shouldReset}
						shouldSpin={shouldSpin}
          >
            <SpinnerSVG
              viewBox='0 0 24 24'
              fill='none'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              spinnerSize={this.props.spinnerSize}
              spinnerColor={this.props.spinnerColor}
              popDuration={this.props.popDuration}
              spinSpeed={this.props.spinSpeed}
              shouldSpin={shouldSpin}
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
        <div id={this.componentId}>
          {this.props.children}
        </div>
      </React.Fragment>
    );
  }
}

Pullable.defaultProps = {
  className: 'pullable',
  centerSpinner: true,
  fadeSpinner: true,
  rotateSpinner: true,
  spinnerSize: 24,
  spinnerOffset: 0,
  spinnerColor: '#000000',
  spinSpeed: 1200,
  popDuration: 200,
  distThreshold: 72,
  resistance: 2.5,
  refreshDuration: 1000,
  resetDuration: 400,
  resetEase: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  shouldPullToRefresh: () => window.scrollY <= 0,
  disabled: false
};

Pullable.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  className: PropTypes.string,
  centerSpinner: PropTypes.bool,
  fadeSpinner: PropTypes.bool,
  rotateSpinner: PropTypes.bool,
  spinnerSize: PropTypes.number,
  spinnerOffset: PropTypes.number,
  spinnerColor: PropTypes.string,
  spinSpeed: PropTypes.number,
  popDuration: PropTypes.number,
  distThreshold: PropTypes.number,
  resistance: PropTypes.number,
  refreshDuration: PropTypes.number,
  resetDuration: PropTypes.number,
  resetEase: PropTypes.string,
  shouldPullToRefresh: PropTypes.func,
  disabled: PropTypes.bool
};

// Styled Components

const Container = styled.div`
  align-items: ${props => props.centerSpinner ? 'center' : 'flex-start'};
  height: ${props => props.height}px;
  transition: ${props => props.shouldReset ? `height ${props.resetDuration}ms ${props.resetEase}` : 'none'};
  display: flex;
  overflow: hidden;
  justify-content: center;
  pointer-events: none;
`

const Spinner = styled.div`
  opacity: ${props => props.fadeSpinner ? props.pctPulled : 1};
  transform: ${props => props.shouldReset
    ? `translateY(${(props.pctPulled * (props.spinnerSize + props.spinnerOffset)) - props.spinnerSize}px) rotate(${props.rotateSpinner && props.shouldSpin ? 90 : 0}deg)`
    : `translateY(${(props.pctPulled * (props.spinnerSize + props.spinnerOffset)) - props.spinnerSize}px) rotate(${props.rotateSpinner ? props.pctPulled * 90 : 0}deg)`};
  transition: ${props => props.shouldReset
    ? `opacity ${props.resetDuration}ms ${props.resetEase}, transform ${props.resetDuration}ms ${props.resetEase}`
    : 'none'};
  transform-origin: center;
`

const scale = keyframes`
  0% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const rotate360 = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const animation = css`
  ${props => props.shouldSpin
    ? css`${scale} ${props.popDuration}ms cubic-bezier(0.55, 0.055, 0.675, 0.19), ${rotate360} ${props.spinSpeed}ms linear ${props.popDuration}ms infinite`
    : 'none'};
`

const SpinnerSVG = styled.svg`
    viewBox: 0;
    width: ${props => props.spinnerSize}px;
    height: ${props => props.spinnerSize}px;
    stroke: ${props => props.spinnerColor};
    animation: ${animation};
`


export default Pullable;
