import React, { PropTypes, Component } from 'react'


export default class Info extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
  }

  render () {
    const {data} = this.props

    if (!data) {
      return null
    }

    return <div className='info'>
      <p>Info Page</p>
    </div>
  }
}
