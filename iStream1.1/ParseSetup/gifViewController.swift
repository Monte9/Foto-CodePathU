//
//  gifViewController.swift
//  ParseSetup
//
//  Created by Jasmine Farrell on 4/2/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import AVFoundation
import UIKit
import Photos

extension UIImage {
    public func imageRotatedByDegrees(degrees: CGFloat, flip: Bool) -> UIImage {
        let radiansToDegrees: (CGFloat) -> CGFloat = {
            return $0 * (180.0 / CGFloat(M_PI))
        }
        let degreesToRadians: (CGFloat) -> CGFloat = {
            return $0 / 180.0 * CGFloat(M_PI)
        }
        
        // calculate the size of the rotated view's containing box for our drawing space
        let rotatedViewBox = UIView(frame: CGRect(origin: CGPointZero, size: size))
        let t = CGAffineTransformMakeRotation(degreesToRadians(degrees));
        rotatedViewBox.transform = t
        let rotatedSize = rotatedViewBox.frame.size
        
        // Create the bitmap context
        UIGraphicsBeginImageContext(rotatedSize)
        let bitmap = UIGraphicsGetCurrentContext()
        
        // Move the origin to the middle of the image so we will rotate and scale around the center.
        CGContextTranslateCTM(bitmap, rotatedSize.width / 2.0, rotatedSize.height / 2.0);
        
        //   // Rotate the image context
        CGContextRotateCTM(bitmap, degreesToRadians(degrees));
        
        // Now, draw the rotated/scaled image into the context
        var yFlip: CGFloat
        
        if(flip){
            yFlip = CGFloat(-1.0)
        } else {
            yFlip = CGFloat(1.0)
        }
        
        CGContextScaleCTM(bitmap, yFlip, -1.0)
        CGContextDrawImage(bitmap, CGRectMake(-size.width / 2, -size.height / 2, size.width, size.height), CGImage)
        
        let newImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return newImage
    }
}


struct RenderSettings {
    
//    var width : CGFloat {
//        return UIScreen.mainScreen().bounds.size.width
//    }
//    
//    var height : CGFloat {
//        return UIScreen.mainScreen().bounds.size.height
//    }
//    var tryH = UIScreen.mainScreen().bounds.size.height
    var width: CGFloat = 720//1280
    var height: CGFloat = 1280//720
    var fps: Int32 = 1   // 1 frames per second
    var avCodecKey = AVVideoCodecH264
    var videoFilename = "stream"
    var videoFilenameExt = "mp4"
    
    var size: CGSize {
        return CGSize(width: width, height: height)
    }
    
    var outputURL: NSURL {
        // Use the CachesDirectory so the rendered video file sticks around as long as we need it to.
        // Using the CachesDirectory ensures the file won't be included in a backup of the app.
        let fileManager = NSFileManager.defaultManager()
        if let tmpDirURL = try? fileManager.URLForDirectory(.CachesDirectory, inDomain: .UserDomainMask, appropriateForURL: nil, create: true) {
            return tmpDirURL.URLByAppendingPathComponent(videoFilename).URLByAppendingPathExtension(videoFilenameExt)
        }
        fatalError("URLForDirectory() failed")
    }
}

class ImageAnimator {
    
    // Apple suggests a timescale of 600 because it's a multiple of standard video rates 24, 25, 30, 60 fps etc.
    static let kTimescale: Int32 = 600
    
    let settings: RenderSettings
    let videoWriter: VideoWriter
    var images: [UIImage]!
    
    var frameNum = 0
    
    class func saveToLibrary(videoURL: NSURL) {
        PHPhotoLibrary.requestAuthorization { status in
            guard status == .Authorized else { return }
            
            PHPhotoLibrary.sharedPhotoLibrary().performChanges({
                PHAssetChangeRequest.creationRequestForAssetFromVideoAtFileURL(videoURL)
            }) { success, error in
                if !success {
                    print("Could not save video to photo library:", error)
                }
            }
        }
    }
    
    class func removeFileAtURL(fileURL: NSURL) {
        do {
            try NSFileManager.defaultManager().removeItemAtPath(fileURL.path!)
        }
        catch _ as NSError {
            // Assume file doesn't exist.
        }
    }
    
    init(renderSettings: RenderSettings) {
        settings = renderSettings
        videoWriter = VideoWriter(renderSettings: settings)
        images = loadImages()
    }
    
    func render(completion: ()->Void) {
        
        // The VideoWriter will fail if a file exists at the URL, so clear it out first.
        ImageAnimator.removeFileAtURL(settings.outputURL)
        
        videoWriter.start()
        videoWriter.render(appendPixelBuffers) {
            ImageAnimator.saveToLibrary(self.settings.outputURL)
            completion()
        }
        
    }
    
    // Replace this logic with your own.
    func loadImages() -> [UIImage] {
        var images = [UIImage]()
        
        for i in 0..<yoImages.count{
            images.append(yoImages[i].image!)
        }
        print("Got all images")
        return images
    }
    
    // This is the callback function for VideoWriter.render()
    func appendPixelBuffers(writer: VideoWriter) -> Bool {
        
        let frameDuration = CMTimeMake(Int64(ImageAnimator.kTimescale / settings.fps), ImageAnimator.kTimescale)
        
        while !images.isEmpty {
            
            if writer.isReadyForData == false {
                // Inform writer we have more buffers to write.
                return false
            }
            
            let image = images.removeFirst()
            let presentationTime = CMTimeMultiply(frameDuration, Int32(frameNum))
            let success = videoWriter.addImage(image, withPresentationTime: presentationTime)
            if success == false {
                fatalError("addImage() failed")
            }
            
            frameNum++
        }
        
        // Inform writer all buffers have been written.
        return true
    }
    
}

class VideoWriter {
    
    let renderSettings: RenderSettings
    
    var videoWriter: AVAssetWriter!
    var videoWriterInput: AVAssetWriterInput!
    var pixelBufferAdaptor: AVAssetWriterInputPixelBufferAdaptor!
    
    var isReadyForData: Bool {
        return videoWriterInput?.readyForMoreMediaData ?? false
    }
    
    class func pixelBufferFromImage(image: UIImage, pixelBufferPool: CVPixelBufferPool, size: CGSize) -> CVPixelBuffer {
        
        var pixelBufferOut: CVPixelBuffer?
        
        let status = CVPixelBufferPoolCreatePixelBuffer(kCFAllocatorDefault, pixelBufferPool, &pixelBufferOut)
        if status != kCVReturnSuccess {
            fatalError("CVPixelBufferPoolCreatePixelBuffer() failed")
        }
        
        let pixelBuffer = pixelBufferOut!
        
        CVPixelBufferLockBaseAddress(pixelBuffer, 0)
        
        let data = CVPixelBufferGetBaseAddress(pixelBuffer)
        let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGBitmapContextCreate(data, Int(size.width), Int(size.height),
                                            8, CVPixelBufferGetBytesPerRow(pixelBuffer), rgbColorSpace, CGImageAlphaInfo.PremultipliedFirst.rawValue)
        
        CGContextClearRect(context, CGRectMake(0, 0, size.width, size.height))
        
        let horizontalRatio = size.width / image.size.width
        let verticalRatio = size.height / image.size.height
        //aspectRatio = max(horizontalRatio, verticalRatio) // ScaleAspectFill
        let aspectRatio = min(horizontalRatio, verticalRatio) // ScaleAspectFit
        
        let newSize = CGSize(width: image.size.width * aspectRatio, height: image.size.height * aspectRatio)
        
        let x = newSize.width < size.width ? (size.width - newSize.width) / 2 : 0
        let y = newSize.height < size.height ? (size.height - newSize.height) / 2 : 0
        
        CGContextDrawImage(context, CGRectMake(x, y, newSize.width, newSize.height), image.CGImage)
        CVPixelBufferUnlockBaseAddress(pixelBuffer, 0)
        
        return pixelBuffer
    }
    
    init(renderSettings: RenderSettings) {
        self.renderSettings = renderSettings
    }
    
    func start() {
        
        let avOutputSettings: [String: AnyObject] = [
            AVVideoCodecKey: renderSettings.avCodecKey,
            AVVideoWidthKey: NSNumber(float: Float(renderSettings.width)),
            AVVideoHeightKey: NSNumber(float: Float(renderSettings.height))
        ]
        
        func createPixelBufferAdaptor() {
            let sourcePixelBufferAttributesDictionary = [
                kCVPixelBufferPixelFormatTypeKey as String: NSNumber(unsignedInt: kCVPixelFormatType_32ARGB),
                kCVPixelBufferWidthKey as String: NSNumber(float: Float(renderSettings.width)),
                kCVPixelBufferHeightKey as String: NSNumber(float: Float(renderSettings.height))
            ]
            pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: videoWriterInput,
                                                                      sourcePixelBufferAttributes: sourcePixelBufferAttributesDictionary)
        }
        
        func createAssetWriter(outputURL: NSURL) -> AVAssetWriter {
            guard let assetWriter = try? AVAssetWriter(URL: outputURL, fileType: AVFileTypeMPEG4) else {
                fatalError("AVAssetWriter() failed")
            }
            
            guard assetWriter.canApplyOutputSettings(avOutputSettings, forMediaType: AVMediaTypeVideo) else {
                fatalError("canApplyOutputSettings() failed")
            }
            
            return assetWriter
        }
        
        videoWriter = createAssetWriter(renderSettings.outputURL)
        videoWriterInput = AVAssetWriterInput(mediaType: AVMediaTypeVideo, outputSettings: avOutputSettings)
        
        if videoWriter.canAddInput(videoWriterInput) {
            videoWriter.addInput(videoWriterInput)
        }
        else {
            fatalError("canAddInput() returned false")
        }
        
        // The pixel buffer adaptor must be created before we start writing.
        createPixelBufferAdaptor()
        
        if videoWriter.startWriting() == false {
            fatalError("startWriting() failed")
        }
        
        videoWriter.startSessionAtSourceTime(kCMTimeZero)
        
        precondition(pixelBufferAdaptor.pixelBufferPool != nil, "nil pixelBufferPool")
    }
    
    func render(appendPixelBuffers: (VideoWriter)->Bool, completion: ()->Void) {
        
        precondition(videoWriter != nil, "Call start() to initialze the writer")
        
        let queue = dispatch_queue_create("mediaInputQueue", nil)
        videoWriterInput.requestMediaDataWhenReadyOnQueue(queue) {
            let isFinished = appendPixelBuffers(self)
            if isFinished {
                self.videoWriterInput.markAsFinished()
                self.videoWriter.finishWritingWithCompletionHandler() {
                    dispatch_async(dispatch_get_main_queue()) {
                        completion()
                    }
                }
            }
            else {
                // Fall through. The closure will be called again when the writer is ready.
            }
        }
    }
    
    func addImage(image: UIImage, withPresentationTime presentationTime: CMTime) -> Bool {
        
        precondition(pixelBufferAdaptor != nil, "Call start() to initialze the writer")
        
        let pixelBuffer = VideoWriter.pixelBufferFromImage(image, pixelBufferPool: pixelBufferAdaptor.pixelBufferPool!, size: renderSettings.size)
        return pixelBufferAdaptor.appendPixelBuffer(pixelBuffer, withPresentationTime: presentationTime)
    }
    
}

var yoImages: [Image] = []

class gifViewController: UIViewController {

    @IBOutlet weak var imageView: UIImageView!
    
    @IBOutlet weak var dismissButton: UIButton!
    
    @IBOutlet weak var shareButton: UIButton!
    
    var noBa : VerticalViewController!
    
    var tempImages: [Image]? = []
    var myImages: [Image]? = []
    
    var copyRot:Bool = false

    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        
        if (myImages != nil) {
            yoImages = myImages!
            if(copyRot == false){
                for i in 0..<myImages!.count{
                 yoImages[i].image! = (myImages![i].image?.imageRotatedByDegrees(90, flip: false))!
                }
                noBa.keepRot = true
            }
            var images = [UIImage]()

            for i in 0..<yoImages.count{
                images.append(yoImages[i].image!)
            }

            imageView.animationImages = images
            imageView.animationDuration = 6.0
            imageView.startAnimating()

        }

        
        

        let settings = RenderSettings()
        let imageAnimator = ImageAnimator(renderSettings: settings)
        imageAnimator.render() {
            print("Video created!")
            let alertController = UIAlertController(title: "Default Style", message: "Yoohoo! Your video was created! Check your library!", preferredStyle: .Alert)
            let OKAction = UIAlertAction(title: "OK", style: .Default) { (action) in
                print("Alert created")
            }
            alertController.addAction(OKAction)
            
            self.presentViewController(alertController, animated: true) {
            }
        }
    }
    
    
    @IBAction func onShareButton(sender: AnyObject) {
        print("Implement share feature")
    }
    
    @IBAction func onDismissButton(sender: AnyObject) {
        self.dismissViewControllerAnimated(false, completion: nil)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

//    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
//        let destination=segue.destinationViewController as? gifViewController
//        ro
//
//    }
}
