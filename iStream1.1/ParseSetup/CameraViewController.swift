//
//  CameraViewController.swift
//  ParseSetup
//
//  Created by Veronika Kotckovich on 4/2/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit
import AVFoundation
import ImageIO

var frontCamera:Bool=false

class CameraViewController: UIViewController, XMCCameraDelegate {
    
    @IBOutlet weak var cameraStill: UIImageView!
    @IBOutlet weak var cameraPreview: UIView!
    @IBOutlet weak var cameraCapture: UIButton!
    @IBOutlet weak var usePhoto: UIButton!
    @IBOutlet weak var RetakePhoto: UIButton!
    
    var preview: AVCaptureVideoPreviewLayer?
    var flippedImage: UIImage!
    var camera: XMCCamera?

    override func viewDidLoad() {
        super.viewDidLoad()
        
        usePhoto.hidden = true
        RetakePhoto.hidden = true
        self.initializeCamera()
    }
    
    override func viewDidAppear(animated: Bool) {
        usePhoto.hidden = true
        RetakePhoto.hidden = true
        self.initializeCamera()
        super.viewDidAppear(animated)
        self.establishVideoPreviewArea()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    func initializeCamera() {
        //self.cameraStatus.text = "Starting Camera"
        self.camera = XMCCamera(sender: self)
    }
    
    func establishVideoPreviewArea() {
        self.preview = AVCaptureVideoPreviewLayer(session: self.camera?.session)
        self.preview?.videoGravity = AVLayerVideoGravityResizeAspectFill
        self.preview?.frame = self.cameraPreview.bounds
        // self.preview?.cornerRadius = 8.0
        self.cameraPreview.layer.addSublayer(self.preview!)
    }

    func cameraSessionConfigurationDidComplete() {
        self.camera?.startCamera()
    }
    
    func cameraSessionDidBegin() {
        // self.cameraStatus.text = ""
        UIView.animateWithDuration(0.225, animations: { () -> Void in
            //  self.cameraStatus.alpha = 0.0
            self.cameraPreview.alpha = 1.0
            self.cameraCapture.alpha = 1.0
            //self.cameraCaptureShadow.alpha = 0.4;
        })
    }
    
    func cameraSessionDidStop() {
        // self.cameraStatus.text = "Camera Stopped"
        UIView.animateWithDuration(0.225, animations: { () -> Void in
            // self.cameraStatus.alpha = 1.0
            self.cameraPreview.alpha = 0.0
        })
    }
    
    @IBAction func captureFrame(sender: AnyObject) {
        cameraCapture.hidden=true
        usePhoto.hidden = false
        RetakePhoto.hidden = false
        UIView.animateWithDuration(0.225, animations: { () -> Void in
            self.cameraPreview.alpha = 0.0;
        })
        
        self.camera?.captureStillImage({ (image) -> Void in
            if image != nil {
                if frontCamera == true{
                    var flippedImage: UIImage = UIImage(CGImage: image!.CGImage!, scale: image!.scale, orientation: .LeftMirrored)
                    self.cameraStill.image = flippedImage;
                }
                else{
                    self.cameraStill.image = image;
                }
                UIView.animateWithDuration(0.225, animations: { () -> Void in
                    self.cameraStill.alpha = 1.0;
                })
            }
        })
    }
    
    
    
    @IBAction func onRetake(sender: AnyObject) {
        cameraCapture.hidden=false
        usePhoto.hidden = true
        RetakePhoto.hidden = true
        UIView.animateWithDuration(0.225, animations: { () -> Void in
            self.cameraStill.alpha = 0.0;
            //self.cameraStatus.alpha = 0.0;
            self.cameraPreview.alpha = 1.0;
            // self.cameraCapture.setTitle("Capture", forState: UIControlState.Normal)
            }, completion: { (done) -> Void in
                self.cameraStill.image = nil;
                //self.status = .Preview
        })
    }
    
    @IBAction func onFrontBack(sender: AnyObject) {
        print("onFrontBack")
        if frontCamera == false {
            self.cameraStill.image = nil
            frontCamera = true
            initializeCamera()
            establishVideoPreviewArea()
            
            cameraCapture.hidden=false
            usePhoto.hidden = true
            RetakePhoto.hidden = true
            
        }
        else {
            frontCamera = false
            self.cameraStill.image = nil
            initializeCamera()
            establishVideoPreviewArea()
            
            cameraCapture.hidden=false
            usePhoto.hidden = true
            RetakePhoto.hidden = true
            
        }
    }
    
    
    @IBAction func goToStreams(sender: AnyObject) {
        let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
        
        let nextViewController = storyBoard.instantiateViewControllerWithIdentifier("toStreams") as! UINavigationController
        self.presentViewController(nextViewController, animated:false, completion:nil)
    }
    

/*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        
        if segue.identifier == "cameraToStream" {
            let viewController = segue.destinationViewController as! ViewController
        }
        
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
