//
//  AddStreamCell.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 4/15/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

@objc protocol AddStreamCellDelegate {
    optional func selectSwitch(selectSwitch: AddStreamCell, didChangeValue value: Bool)
}

class AddStreamCell: UITableViewCell {

    @IBOutlet weak var streamProfilePicture: UIImageView!
    @IBOutlet weak var streamName: UILabel!
    @IBOutlet weak var createdAtLabel: UILabel!
    @IBOutlet weak var selectSwitch: UISwitch!
    
    weak var delegate: AddStreamCellDelegate?
    
    override func awakeFromNib() {
        super.awakeFromNib()
        
        selectSwitch.addTarget(self, action: "switchValueChanged", forControlEvents: UIControlEvents.ValueChanged)
    }
    
    func switchValueChanged() {
        delegate?.selectSwitch?(self, didChangeValue: selectSwitch.on)
    }
    
    var stream : Stream! {
        didSet {
            streamName.text = stream.name
            createdAtLabel.text = stream.date
            selectSwitch.on = false
        }
    }

    override func setSelected(selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        // Configure the view for the selected state
    }

}
