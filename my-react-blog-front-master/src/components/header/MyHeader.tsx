import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import HeaderBlock from './HeaderBlock';
import './MyHeader.scss';


interface MyHeaderState{

}

export default class MyHeader extends Component<any, MyHeaderState>{
    state = {
        headers: [
            {
                icon: <CloudOutlined />,
                text: '云u盘',
                link: '/fileCloud'
            }
        ]
    }

    render(){
        return (
            <div className='my-header'>
                <Row>
                    <Col span="3">
                        LOGO
                    </Col>
                    <Col span="18" className="header-center-container">
                        {
                            this.state.headers.map((item, index) => {
                                return (
                                    <HeaderBlock icon={item.icon}  text={item.text} key={index} />
                                )
                            })
                        }
                    </Col>
                    <Col span="3">
                        OTHER
                    </Col>
                </Row>
            </div>
        )
    }
}