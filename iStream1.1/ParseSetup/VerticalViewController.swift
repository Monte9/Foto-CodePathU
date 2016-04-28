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

//extension UIView {
//    
//    func capture() -> UIImage {
//        
//        UIGraphicsBeginImageContextWithOptions(self.frame.size, self.opaque, UIScreen.mainScreen().scale)
//        self.layer.renderInContext(UIGraphicsGetCurrentContext()!)
//        let image = UIGraphicsGetImageFromCurrentImageContext()
//        UIGraphicsEndImageContext()
//        
//        return image
//    }
//}

class VerticalViewController: UIViewController,  UIGestureRecognizerDelegate, RAReorderableLayoutDelegate, RAReorderableLayoutDataSource, EditImageDelegate {
    
    var DynamicView: UIView?

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
    
    var newlyCreatedFaceOriginalCenter: CGPoint!
    var button:UIButton!
    var saveButton:UIButton!
    var bgImageView: UIImageView?
    
    struct Static {
        static var bgImage: UIImage?
        static var index: Int?
    }
    
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
        loadingView.color = UIColor(red:28/255, green: 165/255, blue: 246/255, alpha: 1)
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
        
        tapGestureRecognizer.numberOfTapsRequired = 1;
        cell.imageView.userInteractionEnabled = true
        cell.imageView.addGestureRecognizer(tapGestureRecognizer)
        
        return cell
    }
    
    @IBAction func imageTapped(sender: UITapGestureRecognizer) {
        bgImageView = sender.view as? UIImageView
     //   var cell = sender as! RACollectionViewCell
      //  VerticalViewController.Static.index = cell.imageView.
        VerticalViewController.Static.bgImage = bgImageView?.image
        //Image.getImagesInStream(sender.streamId)
        self.performSegueWithIdentifier("DetailCellSegue", sender: self)
    }
    
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
    
    func sendImage(image: UIImage) {
        self.imagesForSection0.append(image)
        print("Added the image to section 0")
        self.collectionView.reloadData()
    }
        
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if segue.identifier == "gifSegue" {
            let gifNavController = segue.destinationViewController as! UINavigationController
            let giffyViewController = gifNavController.topViewController as! gifViewController
            
            giffyViewController.myImages = self.images!
            giffyViewController.copyRot = self.rotate
            giffyViewController.noBa=self
        } else if segue.identifier == "DetailCellSegue" {            
            let editViewController = segue.destinationViewController as! EditImage
            editViewController.delegate = self
            editViewController.bgImage = VerticalViewController.Static.bgImage
        }
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