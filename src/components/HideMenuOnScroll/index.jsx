import React from 'react'
import throttle from 'lodash/throttle';
import './style.scss'

class HideMenuOnScroll extends React.Component {

  prevScrollpos;

  componentDidMount() {
    this.registerEvent();
  }

  componentWillUnmount() {
    this.unregisterEvent();
  }

  registerEvent = () => {
    window.addEventListener('scroll', this.onScroll);
  };

  unregisterEvent = () => {
    window.removeEventListener('scroll', this.onScroll);
  };

  onScroll = throttle(() => {
    const currentScrollPos = this.getScrollTop();
    if (this.prevScrollpos > currentScrollPos) {
      document.getElementById("navbar").style.top = "0";
    } else {
      document.getElementById("navbar").style.top = "-50px";
    }
    this.prevScrollpos = currentScrollPos;
  }, 250);

  getScrollTop = () => {
    if (!document.body) return 0;
    const scrollTop = document.documentElement
      ? document.documentElement.scrollTop || document.body.scrollTop
      : document.body.scrollTop;
    return scrollTop;
  };

  render() {
    return (
      <div className="hide_menu_on_scroll" id="navbar">
        {this.props.children}
      </div>
    )
  }
}

export default HideMenuOnScroll
