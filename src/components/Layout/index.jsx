import React from 'react'
import Helmet from 'react-helmet'
import '../../assets/scss/init.scss'
import favicon from '../../pages/photo.png'

class Layout extends React.Component {
  render() {
    const { children } = this.props

    return (
      <div className="layout">
        <Helmet defaultTitle="Regyu Dev log">
          <link rel="shortcut icon" href={favicon} />
          <meta name="google-site-verification" content="t_49cP6QwzmvUiZaME8a6LXRipkHQGiYSoruZ_PSlEc" />
          <meta name="naver-site-verification" content="61e42118f4c8c878479a02a76a96cf21191ee4bc" />
        </Helmet>{' '}
        {children}{' '}
      </div>
    )
  }
}

export default Layout
