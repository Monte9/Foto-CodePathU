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
import RESideMenu

var frontCamera:Bool=false

class CameraViewController: UIViewController, XMCCameraDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    
    @IBOutlet weak var cameraStill: UIImageView!
    @IBOutlet weak var cameraPreview: UIView!
    @IBOutlet weak var cameraCapture: UIButton!
    @IBOutlet weak var usePhoto: UIButton!
    @IBOutlet weak var RetakePhoto: UIButton!
    @IBOutlet weak var background: UIView!
    @IBOutlet weak var flipCamera: UIButton!
    @IBOutlet weak var profileButton: UIButton!
    
    @IBOutlet weak var streams: UIButton!
    @IBOutlet weak var photos: UIButton!
    
    var imageTaken: UIImage!
    
    var preview: AVCaptureVideoPreviewLayer?
    var flippedImage: UIImage!
    var camera: XMCCamera?
    let vc = UIImagePickerController()

    override func viewDidLoad() {

        super.viewDidLoad()
        
        vc.delegate = self
        frontCamera = false
        
        //Make the status bar white color
        UIApplication.sharedApplication().statusBarStyle = .LightContent

        usePhoto.hidden = true
        RetakePhoto.hidden = true
        self.initializeCamera()
    }
    
    override func viewDidAppear(animated: Bool) {
        frontCamera = false
        vc.delegate = self
        
        self.initializeCamera()
        super.viewDidAppear(animated)
        self.establishVideoPreviewArea()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func goToStreams(sender: AnyObject) {
        let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
        let nextViewController = storyBoard.instantiateViewControllerWithIdentifier("toStreams") as! UINavigationController
        self.presentViewController(nextViewController, animated:false, completion:nil)
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
        flipCamera.hidden=true
        photos.hidden=true
        streams.hidden=true
        profileButton.hidden = true
        usePhoto.hidden = false
        RetakePhoto.hidden = false

        UIView.animateWithDuration(0.225, animations: { () -> Void in
            self.cameraPreview.alpha = 0.0;
        })
        
        self.camera?.captureStillImage({ (image) -> Void in
            if image != nil {
                if frontCamera == true{
                    let flippedImage: UIImage = UIImage(CGImage: image!.CGImage!, scale: image!.scale, orientation: .LeftMirrored)
                    self.cameraStill.image = flippedImage;
                    self.imageTaken = image;
                }
                else{
                    self.cameraStill.image = image;
                    self.imageTaken = image;
                }
                UIView.animateWithDuration(0.225, animations: { () -> Void in
                    self.cameraStill.alpha = 1.0;
                })
            }
        })
    }
    
    
    
    @IBAction func onRetake(sender: AnyObject) {
        vc.delegate = self
        
        cameraCapture.hidden=false
        usePhoto.hidden = true
        RetakePhoto.hidden = true
        photos.hidden=false
        streams.hidden=false
        flipCamera.hidden=false
        
        
        background.backgroundColor = UIColor.blackColor().colorWithAlphaComponent(0)
        
        UIView.animateWithDuration(0.225, animations: { () -> Void in
            self.cameraStill.alpha = 0.0;
            self.cameraPreview.alpha = 1.0;
            }, completion: { (done) -> Void in
                self.cameraStill.image = nil;
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
    
    @IBAction func usePthoto(sender: AnyObject) {
        let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
        
        let nextViewController = storyBoard.instantiateViewControllerWithIdentifier("AddToStreamNav") as! UINavigationController
        self.presentViewController(nextViewController, animated:false, completion:nil)
        
    }

    @IBAction func onLibrary(sender: AnyObject) {
        vc.delegate = self
        
        cameraCapture.hidden=true
        photos.hidden=true
        streams.hidden=true
        usePhoto.hidden = false
        RetakePhoto.hidden = false
        background.backgroundColor = UIColor.blackColor().colorWithAlphaComponent(1)
        vc.allowsEditing = true
        vc.sourceType = UIImagePickerControllerSourceType.PhotoLibrary
        
        self.presentViewController(vc, animated: true, completion: nil)
    }
    
    @IBAction func onProfileMenu(sender: AnyObject) {
        self.presentLeftMenuViewController(self)
    }
    
    func imagePickerController(
        picker: UIImagePickerController,
        didFinishPickingMediaWithInfo info: [String : AnyObject])
    {
        let chosenImage = info[UIImagePickerControllerOriginalImage] as! UIImage
        cameraStill.contentMode = .ScaleAspectFit
        self.cameraStill.alpha = 1.0
        cameraStill.image = chosenImage
        imageTaken = chosenImage
        dismissViewControllerAnimated(true, completion: nil)
    }
    
    func imagePickerControllerDidCancel(picker: UIImagePickerController) {
        dismissViewControllerAnimated(true, completion: nil)
        onRetake(self)
    }

    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if segue.identifier == "toAddStreamVC" {
            let addStreamNavigationController = segue.destinationViewController as! UINavigationController
            let addStreamViewController = addStreamNavigationController.topViewController as! AddStreamsViewController
            addStreamViewController.imageToAdd = self.imageTaken
        }
    }

}
