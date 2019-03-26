import React from 'react'
import { Link, graphql } from 'gatsby'
import Helmet from 'react-helmet'
import kebabCase from 'lodash/kebabCase'
import throttle from 'lodash/throttle';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import HideMenuOnScroll from '../components/HideMenuOnScroll';

class TagsRoute extends React.Component {

  getTitleListByTag = (posts, tag) => {
    const elemnts = []
    posts.map(post => {
      const is_include = post.node.frontmatter.tags.includes(tag)
      if (is_include) {
        const { slug } = post.node.fields
        const { title } = post.node.frontmatter
        elemnts.push({ slug, title })
      }
    })

    if (!elemnts) {
      return
    }

    const tag_list = (
      <React.Fragment>
        <h3 className="tag_titles__list-item-title">{tag}</h3>
        <ul>
          {elemnts.map(elemnt => (
            <li key={`${tag}_${elemnt.title}`} className="tag_titles__list-item-content">
              <Link className="tag_titles__list-item-content-link" to={elemnt.slug}>
                {elemnt.title}
              </Link>
            </li>
          ))}
        </ul>
      </React.Fragment>
    )
    return tag_list
  }
  render() {
    const { title } = this.props.data.site.siteMetadata
    const tags = this.props.data.allMarkdownRemark.group
    const posts = this.props.data.allMarkdownRemark.edges
    const top_scroll_anchor = (
      <Link to="tags/#">
        TOP
      </Link>
    )
    return (
      <Layout>
        <div>
          <Helmet title={`All Tags - ${title}`} />
          <Sidebar {...this.props} />
          <div className="content">
            <div className="content__inner">
              <div className="page">
                <HideMenuOnScroll>
                  {top_scroll_anchor}
                </HideMenuOnScroll>
                <h1 className="page__title">Tags</h1>
                <div className="page__body">
                  <div className="tags">
                    <ul className="tags__list">
                      {tags.map(tag => (
                        <li key={tag.fieldValue} className="tags__list-item">
                          <Link
                            to={`/tags/#${kebabCase(tag.fieldValue)}`}
                            className="tags__list-item-link"
                          >
                            #{tag.fieldValue} ({tag.totalCount})
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="tag_titles">
                    <ul className="tag_titles__list">
                      {tags.map(tag => (
                        <li key={`title_${tag.fieldValue}`} id={kebabCase(tag.fieldValue)} className="tag_titles__list-item">
                          {this.getTitleListByTag(posts, tag.fieldValue)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

export default TagsRoute

export const pageQuery = graphql`
  query TagsQuery {
          site {
        siteMetadata {
          title
        subtitle
        copyright
        menu {
          label
          path
        sub_menu{
          label
            path
        }
      }
        author {
          name
          email
        telegram
        twitter
        github
        rss
        vk
      }
    }
  }
  allMarkdownRemark(
    limit: 2000
      filter: {frontmatter: {layout: {eq: "post" }, draft: {ne: true } } }
    ) {
          group(field: frontmatter___tags) {
          fieldValue
        totalCount
        }
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            tags
          }
        }
      }
    }
  }
`