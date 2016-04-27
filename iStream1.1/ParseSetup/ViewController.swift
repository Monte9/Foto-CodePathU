//
//  ViewController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 3/12/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit
import Parse
import MGSwipeTableCell
import NVActivityIndicatorView
import BOZPongRefreshControl
import PullToBounce

class ViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    @IBOutlet weak var tableView: UITableView!
    var streams: [Stream]? = []
    var loadingView: NVActivityIndicatorView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.tableView.alpha = 0.0
            let viewW=self.view.frame.width/2
            let viewH=self.view.frame.width/2
            let xV=self.view.frame.width/2-self.view.frame.width/4
            let yV=self.view.frame.height/2-self.view.frame.width/4
        
            let frame = CGRect(x: xV, y: yV, width: viewW, height: viewH)
            loadingView = NVActivityIndicatorView(frame: frame)
            loadingView.type = .BallScaleRippleMultiple
            loadingView.color = UIColor.redColor()
            loadingView.padding = 20
        
            loadingView.startAnimation()
            self.view.addSubview(loadingView)
        
        
        //=========
        //Make the status bar white color
        UIApplication.sharedApplication().statusBarStyle = .Default
        
        tableView.delegate = self
        tableView.dataSource = self
        
        Stream.getStreams({ (streams, success, error) -> () in
            if error == nil {
                self.streams = streams
                self.tableView.reloadData()
            }
        })
        //loadingView.stopAnimation()
    }
    
    
    func makeHeader() {
        let headerView = UIView()
        headerView.frame = CGRect(x: 0, y: 0, width: view.frame.width, height: 64)
        headerView.backgroundColor = UIColor(red:89/255, green: 165/255, blue: 216/255, alpha: 1)
        self.view.addSubview(headerView)
        
        let headerLine = UILabel()
        headerLine.frame = CGRect(x: 0, y: 0, width: 120, height: 100)
        headerLine.center = CGPoint(x: headerView.frame.width/2 + 25, y: 20 + 44/2)
        headerLine.textColor = UIColor.whiteColor()
        headerLine.text = "SwiftyOS"
        headerView.addSubview(headerLine)
    }
    
    override func preferredStatusBarStyle() -> UIStatusBarStyle {
        return .LightContent
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
    
//    func viewDidLayoutSubviews() {
//        self.pongRefreshControl = BOZPongRefreshControl.attachToTableView(self.tableView, withRefreshTarget: self, andRefreshAction: "refreshTriggered")
//    }
    
    
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return streams?.count ?? 0
    }

    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("StreamCell", forIndexPath: indexPath) as! StreamCell
        
        if (streams != nil) {
            cell.stream = streams![indexPath.row]
            stopLoading()
        }
       
        cell.selectionStyle = UITableViewCellSelectionStyle.None
        
        //configure left buttons
        cell.leftButtons = [MGSwipeButton(title: "", icon: UIImage(named:"cancel.png"), backgroundColor: UIColor.greenColor())]
           // ,MGSwipeButton(title: "", icon: UIImage(named:"checked.png"), backgroundColor: UIColor.blueColor())]
        cell.leftSwipeSettings.transition = MGSwipeTransition.Rotate3D
        
        //configure right buttons
        cell.rightButtons = [MGSwipeButton(title: "Delete", backgroundColor: UIColor.redColor())]
            //,MGSwipeButton(title: "More",backgroundColor: UIColor.lightGrayColor())]
        cell.rightSwipeSettings.transition = MGSwipeTransition.Rotate3D
        
        return cell
    }
    
    

    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {

        if segue.identifier == "showImagesSegue" {
            let photosViewController = segue.destinationViewController as! VerticalViewController
            let streamCell = sender as! StreamCell
            let indexPath = tableView.indexPathForCell(streamCell)
            let newStream = streams![indexPath!.row]
            photosViewController.streamId = newStream.id
            photosViewController.streamName = newStream.name
        }
    }
    
    @IBAction func backToCamera(sender: AnyObject) {
        let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
        let nextViewController = storyBoard.instantiateViewControllerWithIdentifier("rootViewController") as! RootViewController
        self.presentViewController(nextViewController, animated:false, completion:nil)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}

