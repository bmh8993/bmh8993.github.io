import React from 'react'
import { Link } from 'gatsby'
import moment from 'moment'
import './style.scss'

class Post extends React.Component {
  render() {
    const {
      title,
      date,
      category,
      description,
    } = this.props.data.node.frontmatter
    const { slug, categorySlug } = this.props.data.node.fields

    return (
      <div className="post">
        <div className="post__thumbnail">
          <Link className="post__title-link" to={slug} />
        </div>

        <div className="post__content">
          <h2 className="post__content__title">
            <Link className="post__content__title-link" to={slug}>
              {title}
            </Link>
          </h2>

          <div className="post__content__meta">
            <time
              className="post__content__meta-time"
              dateTime={moment(date).format('MMMM D, YYYY')}
            >
              {moment(date).format('YYYY.MM.DD hh:mm')}
            </time>
            <span className="post__content__meta-divider" />
            <span className="post__content__meta-category" key={categorySlug}>
              <Link to={categorySlug} className="post__meta-category-link">
                {category}
              </Link>
            </span>
          </div>
          <p className="post__description">{description}</p>
        </div>
        {/*
          <Link className="post__readmore" to={slug}>
            Read
           </Link>
           */}
      </div>
    )
  }
}

export default Post
