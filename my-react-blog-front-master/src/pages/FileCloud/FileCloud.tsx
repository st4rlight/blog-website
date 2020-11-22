import React, { Component } from 'react';
import { Row, Col, Button, Modal, Input, Checkbox, Alert, message, Spin } from 'antd';
import fightingImg from '../../assets/imgs/fighting.jpg';

import './FileCloud.scss';
import FileType from './FileType/FileType';
import UploadResult from './UploadResult';
import axios from 'axios';

enum TimeUnit{
    HOURS = "HOURS",
    DAYS = "DAYS"
}
interface FileCloudState{
    showUploadModal: boolean
    showExtractModal: boolean
    showPasswordModal: boolean
    showUploadResult: boolean
    newCode: string
    encrypt: boolean
    password: string

    available: {
        time: number,
        timeUnit: TimeUnit
    }[]
    successPrompt: string
    
    inputExtractCode: string
    inputPassword: string
    
    extractCode: number
    time: number
    timeUnit: TimeUnit
    qrCode: string
    uploadId: number

    tips: string
    uploading: boolean
    changeInfoProgress: boolean
    selectedFiles: File[]

    uploadProgress: number
}

export default class FileCloud extends Component<any, FileCloudState>{
    state = {
        showUploadModal: false,
        showExtractModal: false,
        showPasswordModal: false,
        showUploadResult: false,
        extractCode: -1,
        newCode: '',
        encrypt: false,
        password: '',
        qrCode: '',
        availableIndex: 4,
        available: [
            {
                time: 1,
                timeUnit: TimeUnit.HOURS
            },
            {
                time: 12,
                timeUnit: TimeUnit.HOURS
            },
            {
                time: 1,
                timeUnit: TimeUnit.DAYS
            },
            {
                time: 3,
                timeUnit: TimeUnit.DAYS
            },
            {
                time: 5,
                timeUnit: TimeUnit.DAYS
            },
            {
                time: 10,
                timeUnit: TimeUnit.DAYS
            }
        ],
        successPrompt: '提取码修改成功！请牢记新提取码和保存时间。',

        inputExtractCode: '',
        inputPassword: '',
        time: -1,
        timeUnit: TimeUnit.DAYS,
        uploadId: -1,

        tips: "上传成功",
        uploading: false,
        changeInfoProgress: false,
        selectedFiles: [],

        uploadProgress: 0
    }

    handleAddFile(){
        if(this.state.selectedFiles.length > 20){
            message.warning("所选择的文件不能超过20个");
            return;
        }
        let inputDOM = document.getElementById("fileInput");
        inputDOM?.click();
    }

    handleClearFile(){
        let resetButton = document.getElementById("resetButton");

        resetButton?.click();
        this.setState({
            selectedFiles: []
        });
    }
    handleChangeFiles(e: any){
        let newFiles: File[] = Array.prototype.slice.apply(e.currentTarget.files);
        let selectedFiles: File[] = [...this.state.selectedFiles];

        for(let file of newFiles){
            let index = selectedFiles.findIndex((item: File) => item.name === file.name);
            if(index !== -1)
                selectedFiles.splice(index, 1)
            selectedFiles.push(file);
        }
        
        if(selectedFiles.length > 20){
            message.warning("所选择文件不能超过20个");
            return;
        }

        if(parseFloat(this.getTotalFileSize(selectedFiles)) > 200){
            message.warning("所选择文件的总大小不能超过200MB")
            return;
        }

        this.setState({
            selectedFiles
        });
    }
    getTotalFileSize(fileList?: File[]){
        let files : File[] = this.state.selectedFiles;
        if(fileList)
            files = fileList;

        let total = 0;
        files.forEach(item => total += item.size);
        
        return (total / 1024 / 1024).toFixed(2);
    }
    handleRemoveFile(index: number){
        let files = this.state.selectedFiles;
        files.splice(index, 1);

        this.handleClearFile();
        this.setState({
            selectedFiles: files
        });
    }

    async uploadFile(){
        try{
            this.setState({
                uploading: true
            });

            if(this.state.selectedFiles.length === 0){
                message.info("还未选择文件")
            }else if(this.state.selectedFiles.length === 1){
                let formData = new FormData();
                formData.append("file", this.state.selectedFiles[0]);

                await this.uploadFileByAxios(formData, "/api/file/upload");

            }else {
                let formData = new FormData();
                for(let file of this.state.selectedFiles)
                    formData.append("files", file);
    
                await this.uploadFileByAxios(formData, "/api/file/upload/multi");

            }
        }catch(e){
            message.error(e.message);
        }finally{
            this.setState({
                uploading: false,
                uploadProgress: 0
            });
        }
    }

    async changeInfo(){
        this.setState({
            changeInfoProgress: true
        });

        try{
            let body = {
                uploadId: this.state.uploadId,
                oldCode: this.state.extractCode,
                newCode: this.state.newCode,
                time: this.state.time,
                timeUnit: this.state.timeUnit,
                password: this.state.password
            }
            let resp = await fetch("/api/file/changeInfo", {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json());
            

            this.setState({
                tips: "修改成功"
            });
            this.handleUploadResult(resp);
        }catch(e){
            message.error(e.message);
        }finally{
            this.setState({
                changeInfoProgress: false
            })
        }
    }

    async handleDownloadCheck(){
        let url = `/api/file/check/${this.state.inputExtractCode}`;
        if(this.state.inputPassword && this.state.inputPassword !== '')
            url += `/${this.state.inputPassword}`;

        let resp = await fetch(url, {
            method: 'GET'
        }).then(resp => resp.json());


        if(resp.code !== 0 && resp.code !== 4008)
            message.warning(resp.message);
        else if(resp.code === 4008){
            message.warning(resp.message);
            this.setState({
                showExtractModal: false,
                showPasswordModal: true
            });
        }else{
            this.handleDownload();
        }
    }

    async handleDownload(){
        let url = `/api/file/retrieve/${this.state.inputExtractCode}`;
        if(this.state.inputPassword && this.state.inputPassword !== '')
            url += `/${this.state.inputPassword}`;

        let a = document.createElement('a'); 
        a.href = url; 
        a.click();

        message.success("文件提取成功");
        this.setState({
            showExtractModal: false,
            showPasswordModal: false
        })

        this.setState({
            inputExtractCode: '',
            inputPassword: ''
        });
    }

    async uploadFileByAxios(form: FormData, url: string){
        let config = {
            onUploadProgress: (progressEvent: any) => {
                let uploadProgress = progressEvent.loaded / progressEvent.total * 100;
                uploadProgress = uploadProgress | 0;
                this.setState({
                    uploadProgress
                });
            },
            timeout: 900000
        }

        let resp = await axios.post(url, form, config);
        this.handleUploadResult(resp.data);
    }

    handleUploadResult(resp: any){
        if(resp.code === 500)
            throw new Error(resp.message);
        else if(resp.code !== 0){
            message.warning(resp.message);
            return;
        }

        this.handleClearFile();
        let result: UploadResult = resp.data;
        this.setState({
            extractCode: result.extractCode,
            time: result.time,
            timeUnit: result.timeUnit,
            qrCode: result.qrCode,
            uploadId: result.uploadId,
            showUploadModal: false,
            showUploadResult: true,
            selectedFiles: [],
            newCode: '',
        });
    }


    render(){
        return (
            <div className='file-cloud-container'>
                {
                    !this.state.showUploadResult
                        ?
                    <div style={{minWidth: 500}}>
                        <Row justify="center">
                            <Col>
                                <img src={fightingImg} className="img-style" alt="图片加载失败"/>
                            </Col>
                        </Row>

                        <Row justify="space-around">
                            <Col>
                                <Button type="primary" size="large" className="button-style" onClick={() => this.setState({ showUploadModal: true})}>
                                    上传
                                </Button>
                            </Col>
                            <Col>
                                <Button type="primary" size="large" className="button-style" onClick={() => this.setState({showExtractModal: true})} >
                                    下载
                                </Button>
                            </Col>
                        </Row>
                    </div>
                        :
                    <Spin spinning={this.state.changeInfoProgress} tip="修改上传信息中">
                        <div className="upload-result-container">
                            <div style={{marginBottom: 10}}>
                                <Alert
                                    message={<span style={{color: '#52c41a'}}>{this.state.tips}</span>}
                                    type="success" showIcon
                                    className="success-message"
                                />
                            </div>
                            <p className="prompt-title">
                                您的提取码：
                            </p>
                            <Row justify="center" style={{margin: '20px 0'}}>
                                <Col>
                                    <span className="extract-code">
                                        { this.state.extractCode }
                                    </span>
                                </Col>
                            </Row>
                            <p>
                                您可以访问&nbsp;
                                <a href={`http://121.36.6.81:7749/api/file/retrieve/${this.state.extractCode}`}>
                                    http://121.36.6.81:7749/api/file/retrieve/{this.state.extractCode}
                                </a>
                                &nbsp;来直接下载该文件。
                            </p>
                            <div>
                                <p>您可以保存或分享这个二维码:</p>
                                <Row justify="center">
                                    <Col>
                                        <img src={this.state.qrCode} alt="二维码加载失败" style={{width: 176, height: 176}} />
                                    </Col>
                                </Row>
                            </div>
                            <p className="prompt-title upload-line">
                                自定义配置：
                            </p>
                            <div className="upload-line">
                                <div className="upload-line">
                                    <span>
                                        修改提取码
                                    </span>
                                    <Input
                                        placeholder="留空则不修改"
                                        value={this.state.newCode}
                                        onPressEnter={this.changeInfo.bind(this)}
                                        onChange={e => this.setState({newCode: e.target.value})}  style={{width: 200, margin: '0 10px'}}
                                    />
                                    <Checkbox onChange={e => this.setState({encrypt: e.target.checked})} checked={this.state.encrypt}>加密</Checkbox>
                                    <Row justify="center" style={{marginTop: 10}}>
                                        <Col>
                                            必须仅包含数字、字母和下划线，最多32个字符。
                                        </Col>
                                    </Row>
                                </div>
                                {
                                    this.state.encrypt
                                        ?
                                    <div className="upload-line">
                                        <span>
                                            私密分享码
                                        </span>
                                        <Input
                                            value={this.state.password}
                                            onChange={e => this.setState({password: e.target.value})}
                                            onPressEnter={this.changeInfo.bind(this)}
                                            style={{width: 200, margin: '0 10px'}}
                                            type="password"
                                        />
                                    </div>
                                        :
                                    null
                                }
                                <div className="upload-line">
                                    <span>
                                        修改有效期
                                    </span>
                                    {
                                        this.state.available.map((item, index) => {
                                            return (
                                                <span className={`time-available-box ${(this.state.time === item.time && this.state.timeUnit === item.timeUnit) ? 'time-unit-active' : null}`.trim()} onClick={() => this.setState({time: item.time, timeUnit: item.timeUnit})} key={index}>
                                                    { item.time }{ item.timeUnit === TimeUnit.DAYS ? '天' : '小时' }
                                                </span>
                                            );
                                        })
                                    }
                                </div>
                                <div>

                                </div>
                                <Row justify="center">
                                    <Col style={{marginTop: 10}}>
                                        设置上传文件在 Box 上的保存时间。
                                    </Col>
                                </Row>
                            </div>
                            <div className="upload-line">
                                <Row justify="space-between">
                                    <Col>
                                        <Button type="primary" size="large" className="upload-button" onClick={() => this.setState({showUploadResult: false})}>
                                            返回
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button type="primary" size="large" className="upload-button" onClick={this.changeInfo.bind(this)}>
                                            修改
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Spin>
                }

                {/* 上传文件Modal */}
                <Modal
                    visible={this.state.showUploadModal}
                    title={<span className="modal-title">上传文件</span>}
                    width={640}
                    onCancel={() => this.setState({showUploadModal: false})}
                    footer={[
                        <span key={0}>
                            <span style={{color: 'rgb(70, 136, 71)', marginRight: 10}}>
                                已选择&nbsp;{this.state.selectedFiles.length}/20&nbsp;个文件，
                                总大小&nbsp;{this.getTotalFileSize()}&nbsp;M
                            </span>
                                <Button key="submit" type="primary" size="large" className="upload-button" onClick={this.uploadFile.bind(this)} disabled={this.state.uploading}>
                                    上传
                                </Button>
                        </span>

                    ]}
                >
                    <Row gutter={10}>
                        <Col span="5" className="upload-left">
                            <ul style={{padding: 0, margin: 0}}>
                                <li>支持批量上传</li>
                                <li>可修改提取码</li>
                                <li>可设置验证码</li>
                            </ul>
                            <Button type="primary" size="large" className="upload-left-margin" onClick={this.handleAddFile.bind(this)} disabled={this.state.uploading}>添加文件</Button>
                            <Button type="primary" size="large" className="upload-left-margin" onClick={this.handleClearFile.bind(this)} disabled={this.state.uploading}>清空文件</Button>
                            <form style={{display: 'none'}}>
                                <input type="file" id="fileInput" multiple onChange={this.handleChangeFiles.bind(this)} />
                                <input type="reset" id="resetButton" />
                            </form>
                        </Col>
                        <Col span="18" offset="1">
                            <Spin spinning={this.state.uploading} tip={(this.state.uploadProgress < 100) ? `上传中 ${this.state.uploadProgress}%` : '处理中...'}>
                                <div className="upload-rectangle">
                                    {
                                        this.state.selectedFiles.map((item, index) => {
                                            return <FileType file={item} index={index} key={index} handleRemoveFile={this.handleRemoveFile.bind(this)} />
                                        })
                                    }
                                </div>
                            </Spin>
                        </Col>
                    </Row>
                </Modal>

                {/* 提取文件Modal */}
                <Modal
                    visible={this.state.showExtractModal}
                    title={<span className="modal-title">提取文件</span>}
                    width={640}
                    onCancel={() => this.setState({showExtractModal: false})}
                    footer={[
                        <Button key="submit" type="primary" size="large" className="upload-button" onClick={this.handleDownloadCheck.bind(this)}>
                            下载
                        </Button>
                    ]}
                >
                    <span style={{fontSize: 16}}>
                        提取码:
                    </span>
                    <Input
                        value={this.state.inputExtractCode}
                        onPressEnter={this.handleDownloadCheck.bind(this)}
                        onChange={e => this.setState({inputExtractCode: e.target.value})}
                        placeholder="请输入提取码"
                        style={{marginLeft: 10, width: 250}}
                    />
                </Modal>

                {/* 需要密码Modal */}
                <Modal
                    visible={this.state.showPasswordModal}
                    title={<span className="modal-title">提示：您提取的文件为私密文件，请提供验证码</span>}
                    width={640}
                    onCancel={() => this.setState({showPasswordModal: false})}
                    footer={
                        <span style={{display: 'flex', justifyContent: 'space-between'}}>
                            <Button key="return" type="primary" size="large" className="upload-button" onClick={() => this.setState({showPasswordModal: false, showExtractModal: true})}>
                                返回
                            </Button>
                            <Button key="download" type="primary" size="large" className="upload-button" onClick={() => this.handleDownloadCheck()}>
                                下载
                            </Button>
                        </span>
                    }
                >
                    <span style={{fontSize: 16}}>
                        验证码:
                    </span>
                    <Input
                        type="password"
                        value={this.state.inputPassword}
                        onChange={e => this.setState({inputPassword: e.target.value})}
                        placeholder="请输入验证码"
                        style={{marginLeft: 10, width: 250}}
                        onPressEnter={this.handleDownloadCheck.bind(this)}
                    />
                </Modal>
            </div>
        )
    }
} 