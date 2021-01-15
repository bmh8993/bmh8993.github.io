import React from 'react'
import Helmet from 'react-helmet'
import '../../assets/scss/init.scss'
import favicon from '../../pages/photo.png'

class Layout extends React.Component {
  render() {
    const { children } = this.props

    return (
      <div className="layout">
        <Helmet defaultTitle="Blog by 인간지능">
          <link rel="shortcut icon" href={favicon} />
          <meta
            name="google-site-verification"
            content="swq3G9HU89k-urr7vJ5yC-tBFErjxq2ePSgOf0UQ-Tc"
          />

          <meta
            name="naver-site-verification"
            content="77a79e7a3b57fba2737e27fcbfe8e40aebd22d35"
          />
        </Helmet>{' '}
        {children}{' '}
      </div>
    )
  }
}

export default Layout
