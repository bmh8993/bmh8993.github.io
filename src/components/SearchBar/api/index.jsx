import { useStaticQuery, graphql } from "gatsby"

export const getAllMarkdownRemark = () => {
  const { allMarkdownRemark } = useStaticQuery(
    graphql`
      query searchContent{
      allMarkdownRemark(
        limit: 2000, 
        skip: 0, 
        filter: {
          frontmatter: {
            layout: {eq: "post"}, 
            draft: {ne: true}
          }, 
        }) 
        {
        edges {
          node {
            fileAbsolutePath
            fields {
              slug
              categorySlug
            }
            internal {
              content
            }
            frontmatter {
              layout
              title
              category
              tags
            }
          }
        }
      }
    }
    `
  )
  return allMarkdownRemark.edges
}