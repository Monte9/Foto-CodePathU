//
//  VerticalViewController.swift
//  RAReorderableLayout-Demo
//
//  Created by Ryo Aoyama on 11/17/14.
//  Copyright (c) 2014 Ryo Aoyama. All rights reserved.
//

import UIKit
import MediaPlayer
import NVActivityIndicatorView


extension UIView {
    
    func capture() -> UIImage {
        
        UIGraphicsBeginImageContextWithOptions(self.frame.size, self.opaque, UIScreen.mainScreen().scale)
        self.layer.renderInContext(UIGraphicsGetCurrentContext()!)
        let image = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return image
    }
}


class VerticalViewController: UIViewController,  UIGestureRecognizerDelegate, RAReorderableLayoutDelegate, RAReorderableLayoutDataSource {
    
    var DynamicView: UIView?
    var emoji: [UIImage] = [
        UIImage(named: "Untitled")!,
        UIImage(named: "Untitled1")!,
        UIImage(named: "Untitled2")!
    ]

    @IBOutlet weak var collectionView: UICollectionView!
    var loadingView: NVActivityIndicatorView!
    
    var imagesForSection0: [UIImage] = []
    var imagesForSection1: [UIImage] = []
    var keepRot:Bool=false
    
    var faceScale: CGFloat! = CGFloat(1.0)
    
    var streamId: String?
    var images: [Image]?
    var streamName: String?
    var rotate:Bool=false
    var newlyCreatedFace: UIImageView!
    var faceOriginalCenter: CGPoint!
    var newImageView: UIImageView!
    var newlyCreatedFaceOriginalCenter: CGPoint!
    var button:UIButton!
    var merged: Bool!
    
    var saveButton:UIButton!

    
    var id : Int!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.collectionView.alpha = 0.0
        let viewW=self.view.frame.width/2
        let viewH=self.view.frame.width/2
        let xV=self.view.frame.width/2-self.view.frame.width/4
        let yV=self.view.frame.height/2-self.view.frame.width/4
        
        let frame = CGRect(x: xV, y: yV, width: viewW, height: viewH)
        loadingView = NVActivityIndicatorView(frame: frame)
        loadingView.type = .BallPulseRise
        loadingView.color = UIColor.redColor()
        loadingView.padding = 20
        
        loadingView.startAnimation()
        self.view.addSubview(loadingView)
        
        
        self.title = streamName
        let nib = UINib(nibName: "verticalCell", bundle: nil)
        collectionView.registerNib(nib, forCellWithReuseIdentifier: "cell")
        collectionView.delegate = self
        collectionView.dataSource = self
        
        Image.getImagesInStream(streamId) { (images, success, error) -> () in
            if error == nil {
                self.images = images
                self.collectionView.reloadData()

                var i = 0;
                if (!(images!.isEmpty)) {
                    for (i = 0; i < 1; i += 1) {
                        self.imagesForSection0.append(images![i].image!)
                    }
                    for (var j = 1; j < images?.count; j += 1) {
                        self.imagesForSection1.append(images![j].image!)
                    }
                } else {
                    print("No images.. initialized to empty array")
                    self.imagesForSection0 = []
                    self.imagesForSection1 = []
                }
            }
        }
        
        
    }
    
    override func viewDidAppear(animated: Bool) {
        if(keepRot==true){
            rotate=true
        }
    }
    
    func stopLoading(){
        UIView.animateWithDuration(1.0, delay: 0.0, options: UIViewAnimationOptions.CurveEaseOut, animations: {
            self.loadingView.alpha = 0.0
            }, completion: {
                (finished: Bool) -> Void in
                
                UIView.animateWithDuration(1.0, delay: 0.0, options: UIViewAnimationOptions.CurveEaseIn, animations: {
                    self.collectionView.alpha = 1.0
                    }, completion: nil)
        })
    }

    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        collectionView.contentInset = UIEdgeInsetsMake(topLayoutGuide.length, 0, 0, 0)
    }
    
    // RAReorderableLayout delegate datasource
    
    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAtIndexPath indexPath: NSIndexPath) -> CGSize {
        stopLoading()
        let screenWidth = CGRectGetWidth(UIScreen.mainScreen().bounds)
        let onePiecesWidth = floor(screenWidth)
        let twoPiecesWidth = floor(screenWidth / 2.0 - (2.0 / 2))
        if indexPath.section == 0 {
            return CGSizeMake(onePiecesWidth, onePiecesWidth)
        }else {
            return CGSizeMake(twoPiecesWidth, twoPiecesWidth)
        }
    }
    
    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumInteritemSpacingForSectionAtIndex section: Int) -> CGFloat {
        return 2.0
    }
    
    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAtIndex section: Int) -> CGFloat {
        return 2.0
    }
    
    func numberOfSectionsInCollectionView(collectionView: UICollectionView) -> Int {
        return 2
    }
    
    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAtIndex section: Int) -> UIEdgeInsets {
        return UIEdgeInsetsMake(0, 0, 2.0, 0)
    }
    
    func collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if section == 0 {
            return imagesForSection0.count
        }else {
            return imagesForSection1.count
        }
    }
    
    func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCellWithReuseIdentifier("verticalCell", forIndexPath: indexPath) as! RACollectionViewCell
        
        if indexPath.section == 0 {
            cell.imageView.image = imagesForSection0[indexPath.item]
        }else {
            cell.imageView.image = imagesForSection1[indexPath.item]
        }

        var tapGestureRecognizer = UITapGestureRecognizer(target: self, action: "imageTapped:")
        
        // Optionally set the number of required taps, e.g., 2 for a double click
        tapGestureRecognizer.numberOfTapsRequired = 1;
        
        // Attach it to a view of your choice. If it's a UIImageView, remember to enable user interaction
        cell.imageView.userInteractionEnabled = true
        cell.imageView.addGestureRecognizer(tapGestureRecognizer)
        
        print(indexPath)
        
        return cell
    }
    
    
    
    @IBAction func imageTapped(sender: UITapGestureRecognizer) {
        
        //sender.view = DynamicView
        
        let imageView = sender.view as! UIImageView
        newImageView = UIImageView(image: imageView.image)
        
        var width : CGFloat {
            return UIScreen.mainScreen().bounds.size.width
        }
        
        var height : CGFloat {
            return UIScreen.mainScreen().bounds.size.height
        }
        
        DynamicView=UIView(frame: CGRectMake(0, height-80, width, 80))
        DynamicView!.backgroundColor=UIColor.blackColor()

        
        let frame = CGRect(x: 0, y: 60, width: width, height: height-120)
        newImageView.frame = frame
        newImageView.backgroundColor = .blackColor()
        newImageView.contentMode = .Redraw
        newImageView.userInteractionEnabled = true
     //   let tap = UITapGestureRecognizer(target: self, action: "dismissFullscreenImage:")
        print("tapBig")
        
        button = UIButton(type: UIButtonType.System) as UIButton
        button.frame = CGRectMake(236, 80, 100, 50)
        button.backgroundColor = UIColor.greenColor()
        button.setTitle("Test Button", forState: UIControlState.Normal)
        button.addTarget(self, action: "buttonAction:", forControlEvents: UIControlEvents.TouchUpInside)
        
        
        saveButton = UIButton(type: UIButtonType.System) as UIButton
        saveButton.frame = CGRectMake(10, 80, 100, 50)
        saveButton.backgroundColor = UIColor.greenColor()
        saveButton.setTitle("Test Button", forState: UIControlState.Normal)
        saveButton.addTarget(self, action: "buttonActionSave:", forControlEvents: UIControlEvents.TouchUpInside)
    
     //   newImageView.addGestureRecognizer(tap)
        self.view.addSubview(newImageView)
        self.view.addSubview(DynamicView!)
        self.view.addSubview(button)
        self.view.addSubview(saveButton)
        getEmoji()
        
        if merged == true {
            var imageEmoji : UIImage
            imageEmoji = lastchance() as UIImage
            sender.view=imageEmoji
        }
    }
    
    func lastchance()-> UIImage {
        let mergedImage = newImageView.capture()
        return mergedImage
    }
    
    
    func getEmoji(){
//        let emojiView: UIImageView?
        let cols = 3
        let rows = 1
        let cellWidth = Int(DynamicView!.frame.width / CGFloat(cols))
        let cellHeight = Int(DynamicView!.frame.height / CGFloat(rows))
        
        
        for i in 0 ..< emoji.count {
           // let emojiView: UIImageView?
            let x = i % cols * cellWidth
            let y = i / cols * cellHeight
            let imageN = emoji[i]
            let emojiView = UIImageView(image: imageN)
            emojiView.frame = CGRect(x: x, y: y, width: cellWidth, height: cellHeight)
            
            var panGestureRecognizer = UIPanGestureRecognizer(target: self, action: "dragEmoji:")
            
            
            // Attach it to a view of your choice. If it's a UIImageView, remember to enable user interaction
            emojiView.userInteractionEnabled = true
            //emojiView.addGestureRecognizer(panGestureRecognizer)
            
            DynamicView!.addSubview(emojiView)
            emojiView.addGestureRecognizer(panGestureRecognizer)
        }
    }
    
        func buttonActionSave(sender: UIButton){
           merged = true
            Superview.image
        }
        
        
        func buttonAction(sender: UIButton) {
            
            newImageView.removeFromSuperview()
            sender.removeFromSuperview()
            DynamicView!.removeFromSuperview()
            print("tapSmall")
            
        }
    
    func dragEmoji(panGestureRecognizer: UIPanGestureRecognizer) {
       // print("here")
        
        let translation = panGestureRecognizer.translationInView(newlyCreatedFace)
        
        if panGestureRecognizer.state == UIGestureRecognizerState.Began {
            let imageView = panGestureRecognizer.view as! UIImageView
            newlyCreatedFace = UIImageView(image: imageView.image)
            newlyCreatedFace.frame = CGRectMake(0,0, 100, 100)//(0, 0, 60, 60)
            newImageView.addSubview(newlyCreatedFace)
            newlyCreatedFace.center = imageView.center
            newlyCreatedFace.center.y += DynamicView!.frame.origin.y
            faceOriginalCenter = newlyCreatedFace.center
        
        
            print("New smiley created")
            
            
            var panGestureRecognizer = UIPanGestureRecognizer(target: self, action: "onCustomPan:")
            var pinchGestureRecognizer = UIPinchGestureRecognizer(target: self, action: "onCustomPinch:")
            var rotateGestureRecognizer = UIRotationGestureRecognizer(target: self, action: "onCustomRotate:")
            
            
            pinchGestureRecognizer.delegate = self
            self.newlyCreatedFace.addGestureRecognizer(pinchGestureRecognizer)
            // self.newlyCreatedFace.addGestureRecognizer(rotateGestureRecognizer)
            
            panGestureRecognizer.delegate = self
            // Attach it to a view of your choice. If it's a UIImageView, remember to enable user interaction
            newlyCreatedFace.addGestureRecognizer(panGestureRecognizer)
            //  panGestureRecognizer.delegate = self
            newlyCreatedFace.userInteractionEnabled = true
            
            UIView.animateWithDuration(0.3, animations: { () -> Void in
                self.newlyCreatedFace.transform = CGAffineTransformMakeScale(self.faceScale, self.faceScale)
            })
        
        } else if panGestureRecognizer.state == UIGestureRecognizerState.Changed {
            newlyCreatedFace.center = CGPoint(x: faceOriginalCenter.x + translation.x, y: faceOriginalCenter.y + translation.y)
        }
        
    }
    
    func onCustomPan(panGestureRecognizer: UIPanGestureRecognizer) {
        
        // Absolute (x,y) coordinates in parent view
        var point = panGestureRecognizer.locationInView(view)
        
        // Relative change in (x,y) coordinates from where gesture began.
        var translation = panGestureRecognizer.translationInView(view)
        var velocity = panGestureRecognizer.velocityInView(view)
        
        var imageView = panGestureRecognizer.view as! UIImageView
        
        if panGestureRecognizer.state == UIGestureRecognizerState.Began {
            newlyCreatedFaceOriginalCenter = imageView.center
            UIView.animateWithDuration(0.3, animations: { () -> Void in
                imageView.transform = CGAffineTransformMakeScale(self.faceScale + 1.4, self.faceScale + 1.4)
            })
            
        } else if panGestureRecognizer.state == UIGestureRecognizerState.Changed {
            imageView.center = CGPoint(x: translation.x + newlyCreatedFaceOriginalCenter.x, y: translation.y + newlyCreatedFaceOriginalCenter.y)
        } else if panGestureRecognizer.state == UIGestureRecognizerState.Ended {
            UIView.animateWithDuration(0.3, animations: { () -> Void in
                imageView.transform = CGAffineTransformMakeScale(self.faceScale, self.faceScale)
            })
        }
    }

    
    func onCustomPinch(pinchGestureRecognizer: UIPinchGestureRecognizer) {
        print("Pinch!")
        faceScale = pinchGestureRecognizer.scale
        let velocity = pinchGestureRecognizer.velocity
        
        let newImageView = pinchGestureRecognizer.view as! UIImageView
        newImageView.transform = CGAffineTransformMakeScale(faceScale, faceScale)
    }
    
    
    func gestureRecognizer(gestureRecognizer: UIGestureRecognizer!, shouldRecognizeSimultaneouslyWithGestureRecognizer otherGestureRecognizer: UIGestureRecognizer!) -> Bool {
        return true
    }
    
//    func dismissFullscreenImage(sender: UITapGestureRecognizer) {
//        sender.view?.removeFromSuperview()
//        DynamicView!.removeFromSuperview()
//        print("tapSmall")
//    }
    
    
    func collectionView(collectionView: UICollectionView, allowMoveAtIndexPath indexPath: NSIndexPath) -> Bool {
        if collectionView.numberOfItemsInSection(indexPath.section) <= 1 {
            return false
        }
        return true
    }
    
    func collectionView(collectionView: UICollectionView, atIndexPath: NSIndexPath, didMoveToIndexPath toIndexPath: NSIndexPath) {
        var photo: UIImage
        
        if atIndexPath.section == 0 {
            photo = imagesForSection0.removeAtIndex(atIndexPath.item)
        }else {
            photo = imagesForSection1.removeAtIndex(atIndexPath.item)
        }
        
        if toIndexPath.section == 0 {
            imagesForSection0.insert(photo, atIndex: toIndexPath.item)
        }else {
            imagesForSection1.insert(photo, atIndex: toIndexPath.item)
        }
    }
    
    func scrollTrigerEdgeInsetsInCollectionView(collectionView: UICollectionView) -> UIEdgeInsets {
        return UIEdgeInsetsMake(100.0, 100.0, 100.0, 100.0)
    }
    
    func collectionView(collectionView: UICollectionView, reorderingItemAlphaInSection section: Int) -> CGFloat {
        if section == 0 {
            return 0
        }else {
            return 0.3
        }
    }
    
    func scrollTrigerPaddingInCollectionView(collectionView: UICollectionView) -> UIEdgeInsets {
        return UIEdgeInsetsMake(collectionView.contentInset.top, 0, collectionView.contentInset.bottom, 0)
    }
        
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        let gifNavController = segue.destinationViewController as! UINavigationController
        let giffyViewController = gifNavController.topViewController as! gifViewController
        
        giffyViewController.myImages = self.images!
        giffyViewController.copyRot = self.rotate
        giffyViewController.noBa=self
    }
    
}

class RACollectionViewCell: UICollectionViewCell {
    var imageView: UIImageView!
    var gradientLayer: CAGradientLayer?
    var hilightedCover: UIView!
    override var highlighted: Bool {
        didSet {
            hilightedCover.hidden = !highlighted
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        configure()
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        imageView.frame = bounds
        hilightedCover.frame = bounds
        applyGradation(imageView)
    }
    
    private func configure() {
        imageView = UIImageView()
        imageView.autoresizingMask = [.FlexibleWidth, .FlexibleHeight]
        imageView.contentMode = UIViewContentMode.ScaleAspectFill
        addSubview(imageView)
        
        hilightedCover = UIView()
        hilightedCover.autoresizingMask = [.FlexibleWidth, .FlexibleHeight]
        hilightedCover.backgroundColor = UIColor(white: 0, alpha: 0.5)
        hilightedCover.hidden = true
        addSubview(hilightedCover)
    }
    
    private func applyGradation(gradientView: UIView!) {
        gradientLayer?.removeFromSuperlayer()
        gradientLayer = nil
        
        gradientLayer = CAGradientLayer()
        gradientLayer!.frame = gradientView.bounds
        
        let mainColor = UIColor(white: 0, alpha: 0.3).CGColor
        let subColor = UIColor.clearColor().CGColor
        gradientLayer!.colors = [subColor, mainColor]
        gradientLayer!.locations = [0, 1]
        
        gradientView.layer.addSublayer(gradientLayer!)
    }
}