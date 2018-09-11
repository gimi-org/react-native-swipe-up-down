import React, { Component } from 'react';
import {
  Platform,
  Animated,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  TouchableOpacity
} from 'react-native';

import SwipeIcon from './components/SwipeIcon';
import images from './assets/images';

const MARGIN_TOP = Platform.OS === 'ios' ? 0 : 20
type Props = {
  swipeHeight?: number,
  itemMini: object,
  itemFull: object,
  disablePressToShow: boolean,
  style?: object,
  onShowMini?: () => void,
  onShowFull?: () => void,
  onMoveDown?: () => void,
  onMoveUp?: () => void,
  setDeltaY?: Function,
  backgroundColor?: string,
  headerStyle?: *
}

type State = {
  collapsed: boolean,
  animatedY: *,
  offset: number,
  deviceHeight: number
}
let self
export default class SwipeUpDown extends Component<Props, State> {
  static openBar = () => self.showFull()
  static closeBar = () => self.showMini()

  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
      animatedY: new Animated.Value(50),
      offset: props.iPhoneX ? 200 : props.withTabBar ? 100 : 50,
      deviceHeight: Dimensions.get('window').height - MARGIN_TOP
    }
    this.disablePressToShow = props.disablePressToShow || false;
    this.SWIPE_HEIGHT = props.swipeHeight || 50;
    this._panResponder = null;
    this.top = this.SWIPE_HEIGHT;
    this.height = this.SWIPE_HEIGHT;
    this.customStyle = {
      style: {
        opacity: 1,
        bottom: 0,
        top: this.top,
        height: this.height
      }
    };
    this.checkCollapsed = true
    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (event, gestureState) => true,
      // onPanResponderGrant: () => this.state.collapsed && this.setState({collapsed: !this.state.collapsed}),
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this)
    })
    self = this
  }

  _onPanResponderMove(event, gestureState) {
    const {onMoveUp, onMoveDown, setDeltaY} = this.props
    let {deviceHeight, animatedY, offset} = this.state
    setDeltaY(this.convertRange(deviceHeight + gestureState.dy, [0, deviceHeight], [0, 180]))

    // BOUNCE UP
    if (animatedY._value + 20 >= deviceHeight - offset) {
      return animatedY.setValue(deviceHeight - gestureState.dy - offset)
    }
    // BOUNCE DOWN
    if (animatedY._value <= offset) {
      return animatedY.setValue(-gestureState.dy + this.SWIPE_HEIGHT)
    }
    // SWIPE DOWN
    if (gestureState.dy > 0) {
      animatedY.setValue(deviceHeight - gestureState.dy - offset)
      return onMoveDown && onMoveDown()
    }
    // SWIPE UP
    else if (this.checkCollapsed && gestureState.dy < 0) {
       animatedY.setValue(-gestureState.dy + this.SWIPE_HEIGHT)
    }
    else if (this.checkCollapsed && gestureState.dy < -20) {
      animatedY.setValue(-gestureState.dy + this.SWIPE_HEIGHT)
      return onMoveUp && onMoveUp()
    }
  }

  convertRange(value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0]
  }


  _onPanResponderRelease(event, gestureState) {
    let {animatedY} = this.state
    animatedY.flattenOffset()
    if (gestureState.dy < -100 || gestureState.dy < 100) return this.showFull()
    return this.showMini()
  }

  showFull() {
    const {onShowFull, setDeltaY} = this.props
    let {deviceHeight, animatedY, offset} = this.state
    this.setState({collapsed: false})
    Animated.spring(animatedY, {toValue: deviceHeight - offset, friction: 7}).start()
    setDeltaY(180)
    onShowFull && onShowFull()
  }

  showMini() {
    this.setState({collapsed: true})
    const {onShowMini, setDeltaY} = this.props
    let {animatedY} = this.state
    Animated.spring(animatedY, {toValue: 50, friction: 7}).start()
    this.checkCollapsed = true
    setDeltaY(0)
    onShowMini && onShowMini()
  }

  render() {
    const {itemMini, itemFull, style, backgroundColor, headerStyle} = this.props
    const {collapsed, animatedY} = this.state
    return <Animated.View style={[styles.wrapSwipe, {height: animatedY, marginTop: MARGIN_TOP}, style]}>
        <View style={[{backgroundColor: backgroundColor || 'white'}]}  {...this._panResponder.panHandlers}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={this.triggerCollapse}>
            {itemMini}
          </TouchableOpacity>
        </View>
      <View style={[{backgroundColor: backgroundColor || 'white', flex: 1}]}>
        {collapsed ? <View /> : itemFull}
      </View>
    </Animated.View>
  }

  triggerCollapse = () => {
    let {collapsed} = this.state
    return collapsed ? this.showFull() : this.showMini()
  }
}

const styles = StyleSheet.create({
  wrapSwipe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  }
});
