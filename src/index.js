import React, { Component } from 'react';
import {
  Platform,
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

const MARGIN_TOP = Platform.OS === 'ios' ? 0 : 20;
const DEVICE_HEIGHT = Dimensions.get('window').height - MARGIN_TOP;
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
  backgroundColor?: string
};
let self
export default class SwipeUpDown extends Component<Props> {

  static openBar = () => self.showFull()
  static closeBar = () => self.showMini()

  constructor(props) {
    super(props);
    this.state = {
      collapsed: true
    };
    this.disablePressToShow = props.disablePressToShow || false;
    this.SWIPE_HEIGHT = props.swipeHeight || 60;
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

  updateNativeProps() {
    this.viewRef && this.viewRef.setNativeProps && this.viewRef.setNativeProps(this.customStyle)
  }

  setLayoutAnimation = () => {
    var CustomLayoutSpring = {
      duration: 400,
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
      }
    }
    LayoutAnimation.configureNext(CustomLayoutSpring)
  }

  _onPanResponderMove(event, gestureState) {
    const {onMoveUp, onMoveDown, setDeltaY} = this.props
    setDeltaY(this.convertRange(DEVICE_HEIGHT + gestureState.dy, [0, DEVICE_HEIGHT], [0, 180]))
    if (gestureState.dy > 0 && !this.checkCollapsed) {
      // SWIPE DOWN
      this.customStyle.style.top = this.top + gestureState.dy
      this.customStyle.style.height = DEVICE_HEIGHT - gestureState.dy
      this.updateNativeProps();
      onMoveDown && onMoveDown();
    }
    else if (this.checkCollapsed && gestureState.dy < 0) {
      this.top = 0;
      this.customStyle.style.top = DEVICE_HEIGHT + gestureState.dy - 120;
      this.customStyle.style.height = -gestureState.dy + this.SWIPE_HEIGHT;
      this.updateNativeProps();
    }
    else if (this.checkCollapsed && gestureState.dy < -20) {
      // SWIPE UP
      this.top = 0;
      this.customStyle.style.top = DEVICE_HEIGHT + gestureState.dy - 120;
      this.customStyle.style.height = -gestureState.dy + this.SWIPE_HEIGHT;
      this.updateNativeProps();
      onMoveUp && onMoveUp();
    }
  }

  convertRange(value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0]
  }


  _onPanResponderRelease(event, gestureState) {
    if (gestureState.dy < -100 || gestureState.dy < 100) return this.showFull()
    return this.showMini()
  }

  showFull() {
    this.setState({collapsed: false})
    const {onShowFull, setDeltaY} = this.props
    this.customStyle.style.top = 0;
    this.customStyle.style.height = DEVICE_HEIGHT;
    this.updateNativeProps()
    this.setLayoutAnimation()
    this.checkCollapsed = false;
    setDeltaY(180)
    onShowFull && onShowFull();
  }

  showMini() {
    this.setState({collapsed: true})
    const {onShowMini, setDeltaY} = this.props
    this.customStyle.style.top = DEVICE_HEIGHT - this.SWIPE_HEIGHT - 70;
    this.customStyle.style.height = this.SWIPE_HEIGHT;
    this.updateNativeProps()
    this.setLayoutAnimation()
    this.checkCollapsed = true;
    setDeltaY(0)
    onShowMini && onShowMini();
  }

  render() {
    const {itemMini, itemFull, style, backgroundColor} = this.props
    const {collapsed} = this.state;
    return <View ref={ref => this.viewRef = ref} style={[styles.wrapSwipe, {height: this.SWIPE_HEIGHT, marginTop: MARGIN_TOP}, style]}>
        <View {...this._panResponder.panHandlers} style={{backgroundColor: backgroundColor || 'white'}}>
          <TouchableOpacity
            activeOpacity={1}
            style={{height: this.SWIPE_HEIGHT}}
            onPress={this.triggerCollapse}>
            {itemMini}
          </TouchableOpacity>
        </View>
      <View style={[{backgroundColor: backgroundColor || 'white', height: this.SWIPE_HEIGHT, flex: 1}]}>
        {this.customStyle.style.height > 50 ? itemFull : <View />}
      </View>
    </View>
  }
  triggerCollapse = () => {
    let {collapsed} = this.state
    return collapsed ? this.showFull() : this.showMini()
  }
}

const styles = StyleSheet.create({
  wrapSwipe: {
    flex: 1,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  }
});
