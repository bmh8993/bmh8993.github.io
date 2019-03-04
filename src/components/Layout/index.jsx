import React from 'react'
import Helmet from 'react-helmet'
import '../../assets/scss/init.scss'
import favicon from '../../pages/photo.png'

class Layout extends React.Component {
  render() {
    const { children } = this.props

    return (
      <div className="layout">
        <Helmet defaultTitle="Blog by John Doe">
          <link rel="shortcut icon" href={favicon} />
          <meta name="google-site-verification" content="t_49cP6QwzmvUiZaME8a6LXRipkHQGiYSoruZ_PSlEc" />
        </Helmet>{' '}
        {children}{' '}
      </div>
    )
  }
}

export default Layout
