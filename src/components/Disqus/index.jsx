import React, { Component } from 'react'

import { Disqus } from 'gatsby-plugin-disqus'

class DisqusDetails extends Component {

  render() {
    const { postNode, siteMetadata } = this.props
    if (!siteMetadata.disqusShortname) {
      return null
    }
    const post = postNode.frontmatter
    const url = siteMetadata.url + postNode.fields.slug

    let disqusConfig = {
      url: url,
      identifier: postNode.id,
      title: post.title,
    }

    return (
      <Disqus config={disqusConfig} ></Disqus>
    )
  }
}

export default DisqusDetails
