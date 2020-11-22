import React from 'react';
import { Layout } from 'antd';
import './App.scss';
import MyHeader from './components/header/MyHeader';
import FileCloud from './pages/FileCloud/FileCloud';

const { Header, Content } = Layout;

function App() {
    return (
        <div className="App">
            <Layout className='my-app-layout'>
                <Header className="my-header-container">
                    <MyHeader />
                </Header>
                <Content className="my-content-container">
                    <FileCloud />
                </Content>
                <div className="my-footer-container">
                    Footer
                </div>
            </Layout>
        </div>
        
    );
}

export default App;
