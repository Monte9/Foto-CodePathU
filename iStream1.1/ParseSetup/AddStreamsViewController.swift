//
//  AddStreamsViewController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 4/15/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit
import NVActivityIndicatorView
import Spring

class AddStreamsViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, AddStreamCellDelegate, CreateNewStreamControllerDelegate {
    
    var refreshLoadingView : UIView!
    var refreshColorView : UIView!
    var compass_background : UIImageView!
    var compass_spinner : UIImageView!
    var refreshControl: UIRefreshControl!
    
    var isRefreshIconsOverlap = false
    var isRefreshAnimating = false

    @IBOutlet weak var tableView: UITableView!
    var loadingView: NVActivityIndicatorView!
    
    var allStreams: [Stream]? = []
    var addStreams: [Stream]? = []
    var imageToAdd: UIImage?
    
    var names: [String] = ["San Francisco", "Super Bowl", "Hiking", "Movie", "Date", "New York", "1 WTC", "Stawp it!"]
    var namesIndex: Int = 0
    
    
    func setupRefreshControl() {
        
        print("onsetupRefreshControl()")
        // Programmatically inserting a UIRefreshControl
        self.refreshControl = UIRefreshControl()
        
        // Setup the loading view, which will hold the moving graphics
        self.refreshLoadingView = UIView(frame: self.refreshControl!.bounds)
        self.refreshLoadingView.backgroundColor = UIColor.clearColor()
        
        // Setup the color view, which will display the rainbowed background
        self.refreshColorView = UIView(frame: self.refreshControl!.bounds)
        self.refreshColorView.backgroundColor = UIColor.clearColor()
        self.refreshColorView.alpha = 0.30
        
        // Create the graphic image views
        
        compass_background = UIImageView(image: UIImage(named: "compass_background"))
        
        self.compass_spinner = UIImageView(image: UIImage(named: "compass_spinner"))
        
        // Add the graphics to the loading view
        self.refreshLoadingView.addSubview(self.compass_background)
        self.refreshLoadingView.addSubview(self.compass_spinner)
        
        // Clip so the graphics don't stick out
        self.refreshLoadingView.clipsToBounds = true;
        
        // Hide the original spinner icon
        self.refreshControl!.tintColor = UIColor.clearColor()
        
        // Add the loading and colors views to our refresh control
        self.refreshControl!.addSubview(self.refreshColorView)
        self.refreshControl!.addSubview(self.refreshLoadingView)
        
        // Initalize flags
        self.isRefreshIconsOverlap = false;
        self.isRefreshAnimating = false;
        
        // When activated, invoke our refresh function
        
        self.refreshControl?.addTarget(self, action: "refresh", forControlEvents: UIControlEvents.ValueChanged)
        print("I am at the end")
    }
    
    func refresh(){
        
        // -- DO SOMETHING AWESOME (... or just wait 3 seconds) --
        // This is where you'll make requests to an API, reload data, or process information
        var delayInSeconds = 3.0;
        var popTime = dispatch_time(DISPATCH_TIME_NOW, Int64(delayInSeconds * Double(NSEC_PER_SEC)));
        dispatch_after(popTime, dispatch_get_main_queue()) { () -> Void in
            // When done requesting/reloading/processing invoke endRefreshing, to close the control
            self.refreshControl!.endRefreshing()
        }
        // -- FINISHED SOMETHING AWESOME, WOO! --
    }
    
    func scrollViewDidScroll(scrollView: UIScrollView) {
        print("scrollViewDidScroll")
        // Get the current size of the refresh controller
        var refreshBounds = self.refreshControl!.bounds;
        
        // Distance the table has been pulled >= 0
        var pullDistance = max(0.0, -self.refreshControl!.frame.origin.y);
        
        // Half the width of the table
        var midX = self.tableView.frame.size.width / 2.0;
        
        // Calculate the width and height of our graphics
        var compassHeight = self.compass_background.bounds.size.height;
        var compassHeightHalf = compassHeight / 2.0;
        
        var compassWidth = self.compass_background.bounds.size.width;
        var compassWidthHalf = compassWidth / 2.0;
        
        var spinnerHeight = self.compass_spinner.bounds.size.height;
        var spinnerHeightHalf = spinnerHeight / 2.0;
        
        var spinnerWidth = self.compass_spinner.bounds.size.width;
        var spinnerWidthHalf = spinnerWidth / 2.0;
        
        // Calculate the pull ratio, between 0.0-1.0
        var pullRatio = min( max(pullDistance, 0.0), 100.0) / 100.0;
        
        // Set the Y coord of the graphics, based on pull distance
        var compassY = pullDistance / 2.0 - compassHeightHalf;
        var spinnerY = pullDistance / 2.0 - spinnerHeightHalf;
        
        // Calculate the X coord of the graphics, adjust based on pull ratio
        var compassX = (midX + compassWidthHalf) - (compassWidth * pullRatio);
        var spinnerX = (midX - spinnerWidth - spinnerWidthHalf) + (spinnerWidth * pullRatio);
        
        // When the compass and spinner overlap, keep them together
        if (fabsf(Float(compassX - spinnerX)) < 1.0) {
            self.isRefreshIconsOverlap = true;
        }
        
        // If the graphics have overlapped or we are refreshing, keep them together
        if (self.isRefreshIconsOverlap || self.refreshControl!.refreshing) {
            compassX = midX - compassWidthHalf;
            spinnerX = midX - spinnerWidthHalf;
        }
        
        // Set the graphic's frames
        var compassFrame = self.compass_background.frame;
        compassFrame.origin.x = compassX;
        compassFrame.origin.y = compassY;
        
        var spinnerFrame = self.compass_spinner.frame;
        spinnerFrame.origin.x = spinnerX;
        spinnerFrame.origin.y = spinnerY;
        
        self.compass_background.frame = compassFrame;
        self.compass_spinner.frame = spinnerFrame;
        
        // Set the encompassing view's frames
        refreshBounds.size.height = pullDistance;
        
        self.refreshColorView.frame = refreshBounds;
        self.refreshLoadingView.frame = refreshBounds;
        
        // If we're refreshing and the animation is not playing, then play the animation
        if (self.refreshControl!.refreshing && !self.isRefreshAnimating) {
            self.animateRefreshView()
        }

    }
    
    func animateRefreshView() {
        print("i  am in the refresh")
        // Background color to loop through for our color view
        
        var colorArray = [UIColor.redColor(), UIColor.blueColor(), UIColor.purpleColor(), UIColor.cyanColor(), UIColor.orangeColor(), UIColor.magentaColor()]
        
        // In Swift, static variables must be members of a struct or class
        struct ColorIndex {
            static var colorIndex = 0
        }
        
        // Flag that we are animating
        self.isRefreshAnimating = true;
        
        UIView.animateWithDuration(
            Double(0.3),
            delay: Double(0.0),
            options: UIViewAnimationOptions.CurveLinear,
            animations: {
                // Rotate the spinner by M_PI_2 = PI/2 = 90 degrees
                self.compass_spinner.transform = CGAffineTransformRotate(self.compass_spinner.transform, CGFloat(M_PI_2))
                
                // Change the background color
                self.refreshColorView!.backgroundColor = colorArray[ColorIndex.colorIndex]
                ColorIndex.colorIndex = (ColorIndex.colorIndex + 1) % colorArray.count
            },
            completion: { finished in
                // If still refreshing, keep spinning, else reset
                if (self.refreshControl!.refreshing) {
                    self.animateRefreshView()
                }else {
                    self.resetAnimation()
                }
            }
        )
    }
    
    func resetAnimation() {
        print("resetAnimation")
        // Reset our flags and }background color
        self.isRefreshAnimating = false;
        self.isRefreshIconsOverlap = false;
        self.refreshColorView.backgroundColor = UIColor.clearColor()
    }
    

    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.tableView.alpha = 0.0
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
        
        //Make the status bar white color
        UIApplication.sharedApplication().statusBarStyle = .Default
        
        tableView.delegate = self
        tableView.dataSource = self
        
        Stream.getStreams({ (streams, success, error) -> () in
            if error == nil {
                self.allStreams = streams
                self.tableView.reloadData()
            }
        })
        
        self.setupRefreshControl()
        tableView.addSubview(refreshControl)

    }
    
    func viewMoveInFromBottom(view:UIView, animationTime:Float)
    {
        var animation:CATransition = CATransition()
        animation.duration = CFTimeInterval(animationTime)
        animation.type = "moveIn"
        animation.timingFunction = CAMediaTimingFunction(name: "easeInEaseOut")
        animation.subtype = "fromTop"
        view.layer.addAnimation(animation, forKey: nil)
    }
    
    
    func stopLoading(){
        UIView.animateWithDuration(1.0, delay: 0.0, options: UIViewAnimationOptions.CurveEaseOut, animations: {
            self.loadingView.alpha = 0.0
            }, completion: {
                (finished: Bool) -> Void in
                

                
                UIView.animateWithDuration(1.0, delay: 0.0, options: UIViewAnimationOptions.CurveEaseIn, animations: {
                    self.tableView.alpha = 1.0
                    }, completion: nil)
        })
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return allStreams?.count ?? 0
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("AddStreamCell", forIndexPath: indexPath) as! AddStreamCell
        
        cell.selectionStyle = UITableViewCellSelectionStyle.None
        cell.delegate = self
        
        if (allStreams != nil) {
            stopLoading()
            cell.stream = allStreams![indexPath.row]
            cell.selectSwitch.on = allStreams![indexPath.row].shouldAddImage ?? false
        }
        
        return cell
    }
    
    func sendValue(value: NSString) {
        let newStream = Stream(name: value as String)
        allStreams?.append(newStream)
        tableView.reloadData()
        print("New stream created with name: \(value)")
    }
    
    @IBAction func onCancelButton(sender: AnyObject) {
        let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
        let rootViewController = storyBoard.instantiateViewControllerWithIdentifier("rootViewController") as! RootViewController
        self.presentViewController(rootViewController, animated:false, completion:nil)
    }
    
    func selectSwitch(selectSwitch: AddStreamCell, didChangeValue value: Bool) {
        let indexPath = tableView.indexPathForCell(selectSwitch)
        allStreams![indexPath!.row].shouldAddImage = true
    }
    
    @IBAction func addImageToStreams(sender: UITapGestureRecognizer) {
        if (imageToAdd != nil) {
            
            for (var i=0; i<allStreams?.count; i += 1) {
                //check if the switch of the stream is on. 
                //If yes, then add it to the addStreams var
                
                if (allStreams![i].shouldAddImage == true ) {
                    addStreams?.append(allStreams![i])
                    print("Adding image to \(allStreams![i].name)")
                }
            }
            
            for (var i=0; i<addStreams?.count; i += 1) {
                let newImage = Image(image: imageToAdd!, id: addStreams![i].id)
            }
            
            let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
            let rootViewController = storyBoard.instantiateViewControllerWithIdentifier("toStreams") as! UINavigationController
            self.presentViewController(rootViewController, animated:false, completion:nil)
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?){
        if let destinationViewController = segue.destinationViewController as? CreateNewStreamController {
            destinationViewController.delegate = self
        }
    }

}
