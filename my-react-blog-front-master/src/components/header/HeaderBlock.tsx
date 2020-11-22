import React, { Component } from 'react';
import './HeaderBlock.scss';

interface HeaderBlockProps{
    icon: any
    text: string
}

export default class HeaderBlock extends Component<HeaderBlockProps, any>{
    render(){
        return (
            <div className='header-block'>
                <span className='icon'>
                    { this.props.icon }
                </span>
                <span className="title">
                    { this.props.text }
                </span>
            </div>
        )
    }
}