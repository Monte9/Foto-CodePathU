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

    @IBOutlet weak var tableView: UITableView!
    var loadingView: NVActivityIndicatorView!
    
    var allStreams: [Stream]? = []
    var addStreams: [Stream]? = []
    var imageToAdd: UIImage?
    
    var names: [String] = ["San Francisco", "Super Bowl", "Hiking", "Movie", "Date", "New York", "1 WTC", "Stawp it!"]
    var namesIndex: Int = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.tableView.alpha = 0.0
        let viewW=self.view.frame.width/2
        let viewH=self.view.frame.width/2
        let xV=self.view.frame.width/2-self.view.frame.width/4
        let yV=self.view.frame.height/2-self.view.frame.width/4
        
        let frame = CGRect(x: xV, y: yV, width: viewW, height: viewH)
        loadingView = NVActivityIndicatorView(frame: frame)
        loadingView.type = .SquareSpin
        loadingView.color = UIColor.redColor()
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
        print("Got the touch")
        if (imageToAdd != nil) {
            
            for (var i=0; i<allStreams?.count; i += 1) {
                //check if the switch of the stream is on. 
                //If yes, then add it to the addStreams var
                
                if (allStreams![i].shouldAddImage == true ) {
                    addStreams?.append(allStreams![i])
                    print("Adding image to \(allStreams![i].name) right?")
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
