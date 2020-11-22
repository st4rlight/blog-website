export default interface UploadResult{
    extractCode: number
    qrCode: string
    time: number
    timeUnit: TimeUnit
    uploadId: number
    message: string
    requestId: string
    timeCost: number
}
enum TimeUnit{
    HOURS = "HOURS",
    DAYS = "DAYS"
}